import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import Experience from '#models/experience'
import Mission from '#models/mission'
import Skill from '#models/skill'
import Domain from '#models/domain'
import Certification from '#models/certification'
import CompetencyRating from '#models/competency_rating'

export default class ProfileController {
  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
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

  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    return response.ok(this.serializeUser(user))
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)

    if (Object.keys(data).length === 0) {
      return response.badRequest({ message: 'No fields provided' })
    }

    user.merge(data)
    await user.save()
    return response.ok(this.serializeUser(user))
  }

  async compile({ auth, response }: HttpContext) {
    auth.getUserOrFail()
    // TODO Phase 2: pass user context to AI compilation
    return response.ok({ compiled: 0, total: 0, message: 'Compilation IA disponible en Phase 2' })
  }

  async cleanContent({ auth, response }: HttpContext) {
    const userId = auth.getUserOrFail().id

    const deleted = await db.transaction(async (trx) => {
      // Delete in FK-safe order: missions before experiences, skills before domains.
      // `model` is a Lucid model class; typed `any` to avoid union-of-static-types friction.
      const purge = async (model: any): Promise<number> => {
        const rows = await model.query({ client: trx }).where('userId', userId)
        const count = rows.length
        if (count > 0) await model.query({ client: trx }).where('userId', userId).delete()
        return count
      }

      const missions = await purge(Mission)
      const experiences = await purge(Experience)
      const skills = await purge(Skill)
      const domains = await purge(Domain)
      const certifications = await purge(Certification)
      const competencyRatings = await purge(CompetencyRating)

      return { experiences, missions, skills, domains, certifications, competencyRatings }
    })

    return response.ok({ deleted })
  }
}
