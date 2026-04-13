import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'
import User from '#models/user'

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
}
