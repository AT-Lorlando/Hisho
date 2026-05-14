import type { HttpContext } from '@adonisjs/core/http'
import Certification from '#models/certification'
import { createCertificationValidator, updateCertificationValidator } from '#validators/certifications'
import { generateSlug } from '../utils/slug.js'

export default class CertificationsController {
  async index({ auth, response }: HttpContext) {
    const certs = await Certification.query()
      .where('userId', auth.user!.id)
      .orderBy('date', 'desc')
    return response.ok(certs.map((c) => c.serialize()))
  }

  async show({ auth, params, response }: HttpContext) {
    const cert = await Certification.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!cert) return response.notFound({ message: 'Certification not found' })
    return response.ok(cert.serialize())
  }

  async store({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const data = await createCertificationValidator.validate(request.body())
    const slug = generateSlug(data.title)
    const exists = await Certification.query().where('userId', userId).where('slug', slug).first()
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const cert = await Certification.create({ ...data, slug, tags: data.tags ?? [], userId })
    return response.created({ slug: cert.slug })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const cert = await Certification.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!cert) return response.notFound({ message: 'Certification not found' })
    const data = await updateCertificationValidator.validate(request.body())
    cert.merge({ ...data, tags: data.tags ?? cert.tags })
    await cert.save()
    return response.ok({ slug: cert.slug })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const cert = await Certification.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!cert) return response.notFound({ message: 'Certification not found' })
    await cert.delete()
    return response.noContent()
  }
}
