import { PassThrough } from 'node:stream'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Skill from '#models/skill'
import Domain from '#models/domain'
import Certification from '#models/certification'
import aiService from '#services/ai_service'
import { chatValidator } from '#validators/chat'
import {
  buildProfileContext,
  buildChatSystemPrompt,
  isProfileEmpty,
  type ProfileContextInput,
} from '#services/profile_context'

function serializePublicUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    title: user.title,
    bio: user.bio,
    location: user.location,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    websiteUrl: user.websiteUrl,
  }
}

export default class PublicProfileController {
  private parseUserId(raw: string): number | null {
    const id = Number(raw)
    return Number.isFinite(id) ? id : null
  }

  async listUsers({ response }: HttpContext) {
    const users = await User.all()
    return response.ok(users.map(serializePublicUser))
  }

  async profile({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    return response.ok(serializePublicUser(user))
  }

  async experiences({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    const experiences = await Experience.query()
      .where('userId', user.id)
      .withCount('missions')
      .orderBy('start_date', 'desc')
    return response.ok(
      experiences.map((exp) => ({
        ...exp.serialize(),
        missionCount: Number(exp.$extras.missions_count),
      }))
    )
  }

  async experience({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    const experience = await Experience.query()
      .where('userId', user.id)
      .where('slug', params.slug)
      .first()
    if (!experience) return response.notFound({ message: 'Experience not found' })
    return response.ok(experience.serialize())
  }

  async missions({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    const missions = await Mission.query()
      .where('userId', user.id)
      .preload('experience')
      .orderBy('start_date', 'desc')
    return response.ok(
      missions.map((m) => {
        const data = m.serialize() as Record<string, any>
        delete data.experienceId
        if (m.experienceId !== null && m.experience) {
          data.experience = m.experience.slug
        }
        return data
      })
    )
  }

  async skills({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    const skills = await Skill.query()
      .where('userId', user.id)
      .preload('domain')
      .orderBy('title', 'asc')
    return response.ok(
      skills.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        domain: s.domain ? { slug: s.domain.slug, title: s.domain.title } : null,
        level: s.level,
        yearsOfExperience: s.yearsOfExperience,
        aiSummary: s.aiSummary,
        body: s.body,
      }))
    )
  }

  async domains({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    const domains = await Domain.query()
      .where('userId', user.id)
      .orderBy('title', 'asc')
    return response.ok(domains.map((d) => d.serialize()))
  }

  async certifications({ params, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })
    const certs = await Certification.query()
      .where('userId', user.id)
      .orderBy('date', 'desc')
    return response.ok(certs.map((c) => c.serialize()))
  }

  async counts({ params, response }: HttpContext) {
    const parsedId = this.parseUserId(params.id as string)
    if (!parsedId) return response.notFound({ message: 'User not found' })
    const user = await User.find(parsedId)
    if (!user) return response.notFound({ message: 'User not found' })
    const userId = user.id
    const [experiences, missions, skills, domains, certifications] = await Promise.all([
      Experience.query().where('userId', userId).count('id as total'),
      Mission.query().where('userId', userId).count('id as total'),
      Skill.query().where('userId', userId).count('id as total'),
      Domain.query().where('userId', userId).count('id as total'),
      Certification.query().where('userId', userId).count('id as total'),
    ])
    return response.ok({
      experiences: Number(experiences[0].$extras.total),
      missions: Number(missions[0].$extras.total),
      skills: Number(skills[0].$extras.total),
      domains: Number(domains[0].$extras.total),
      certifications: Number(certifications[0].$extras.total),
    })
  }

  async chat({ params, request, response }: HttpContext) {
    const userId = this.parseUserId(params.id as string)
    if (!userId) return response.notFound({ message: 'User not found' })
    const user = await User.find(userId)
    if (!user) return response.notFound({ message: 'User not found' })

    const { messages } = await request.validateUsing(chatValidator)

    const [experiences, persoMissions, skills, certifications] = await Promise.all([
      Experience.query().where('userId', user.id).preload('missions').orderBy('start_date', 'desc'),
      Mission.query().where('userId', user.id).where('type', 'perso').orderBy('start_date', 'desc'),
      Skill.query().where('userId', user.id).preload('domain').orderBy('title', 'asc'),
      Certification.query().where('userId', user.id).orderBy('date', 'desc'),
    ])

    const context: ProfileContextInput = {
      user: {
        fullName: user.fullName,
        title: user.title,
        bio: user.bio,
        location: user.location,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        websiteUrl: user.websiteUrl,
      },
      experiences: experiences.map((e) => ({
        title: e.title,
        role: e.role,
        client: e.client,
        type: e.type,
        startDate: e.startDate,
        endDate: e.endDate,
        body: e.body,
        missions: e.missions.map((m) => ({
          title: m.title,
          client: m.client,
          startDate: m.startDate,
          endDate: m.endDate,
          domains: (m.domains ?? []).map((d) => d.name),
          skills: (m.skills ?? []).map((s) => s.name),
          body: m.body,
        })),
      })),
      persoMissions: persoMissions.map((m) => ({
        title: m.title,
        client: m.client,
        startDate: m.startDate,
        endDate: m.endDate,
        domains: (m.domains ?? []).map((d) => d.name),
        skills: (m.skills ?? []).map((s) => s.name),
        body: m.body,
      })),
      skills: skills.map((s) => ({
        title: s.title,
        level: s.level,
        domain: s.domain ? s.domain.title : null,
      })),
      certifications: certifications.map((c) => ({
        title: c.title,
        organism: c.organism,
        date: c.date,
      })),
    }

    const pass = new PassThrough()
    pass.on('error', () => {}) // ignore EPIPE when client disconnects early

    response.header('Content-Type', 'text/event-stream')
    response.header('Cache-Control', 'no-cache')
    response.header('Connection', 'keep-alive')
    response.header('X-Accel-Buffering', 'no')

    const send = (payload: object) => {
      if (!pass.destroyed) pass.write(`data: ${JSON.stringify(payload)}\n\n`)
    }

    if (isProfileEmpty(context)) {
      send({ type: 'error', message: "Ce profil ne contient pas encore d'informations à présenter." })
      pass.end()
      return response.stream(pass)
    }

    const systemPrompt = buildChatSystemPrompt(user.fullName ?? 'cette personne', buildProfileContext(context))

    void (async () => {
      try {
        await aiService.chat(systemPrompt, messages, (delta, isThinking) => {
          send({ type: 'chunk', content: delta, isThinking })
        })
        send({ type: 'done' })
      } catch (e: any) {
        send({ type: 'error', message: e?.message ?? 'AI service error' })
      } finally {
        pass.end()
      }
    })()

    return response.stream(pass)
  }
}
