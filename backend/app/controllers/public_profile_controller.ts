import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Skill from '#models/skill'
import Domain from '#models/domain'
import Certification from '#models/certification'

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
    phone: user.phone,
    availability: user.availability,
    dailyRate: user.dailyRate,
    lastCompiledAt: user.lastCompiledAt,
  }
}

export default class PublicProfileController {
  async listUsers({ response }: HttpContext) {
    const users = await User.all()
    return response.ok(users.map(serializePublicUser))
  }

  async profile({ params, response }: HttpContext) {
    const user = await User.find(Number(params.id))
    if (!user) return response.notFound({ message: 'User not found' })
    return response.ok(serializePublicUser(user))
  }

  async experiences({ params, response }: HttpContext) {
    const user = await User.find(Number(params.id))
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
    const user = await User.find(Number(params.id))
    if (!user) return response.notFound({ message: 'User not found' })
    const experience = await Experience.query()
      .where('userId', user.id)
      .where('slug', params.slug)
      .first()
    if (!experience) return response.notFound({ message: 'Experience not found' })
    return response.ok(experience.serialize())
  }

  async missions({ params, response }: HttpContext) {
    const user = await User.find(Number(params.id))
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
    const user = await User.find(Number(params.id))
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
    const user = await User.find(Number(params.id))
    if (!user) return response.notFound({ message: 'User not found' })
    const domains = await Domain.query()
      .where('userId', user.id)
      .orderBy('title', 'asc')
    return response.ok(domains.map((d) => d.serialize()))
  }

  async certifications({ params, response }: HttpContext) {
    const user = await User.find(Number(params.id))
    if (!user) return response.notFound({ message: 'User not found' })
    const certs = await Certification.query()
      .where('userId', user.id)
      .orderBy('date', 'desc')
    return response.ok(certs.map((c) => c.serialize()))
  }

  async counts({ params, response }: HttpContext) {
    const user = await User.find(Number(params.id))
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
}
