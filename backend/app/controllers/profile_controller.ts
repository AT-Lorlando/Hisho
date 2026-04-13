import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'

export default class ProfileController {
  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    return response.ok({
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
    })
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)
    user.merge(data)
    await user.save()
    return response.ok({
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
    })
  }

  async compile({ auth, response }: HttpContext) {
    auth.getUserOrFail()
    // Stub Phase 1 — IA en Phase 2
    return response.ok({ compiled: 0, total: 0, message: 'Compilation IA disponible en Phase 2' })
  }
}
