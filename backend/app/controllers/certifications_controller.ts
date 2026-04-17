import type { HttpContext } from '@adonisjs/core/http'
import Certification from '#models/certification'
import { createCertificationValidator, updateCertificationValidator } from '#validators/certifications'
import { generateSlug } from '../utils/slug.js'

export default class CertificationsController {
  async index({ response }: HttpContext) {
    const certs = await Certification.query().orderBy('date', 'desc')
    return response.ok(certs.map((c) => c.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const cert = await Certification.findBy('slug', params.slug)
    if (!cert) return response.notFound({ message: 'Certification not found' })
    return response.ok(cert.serialize())
  }

  async store({ request, response }: HttpContext) {
    const data = await createCertificationValidator.validate(request.body())
    const slug = generateSlug(data.title)
    const exists = await Certification.findBy('slug', slug)
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const cert = await Certification.create({ ...data, slug, tags: data.tags ?? [] })
    return response.created({ slug: cert.slug })
  }

  async update({ params, request, response }: HttpContext) {
    const cert = await Certification.findBy('slug', params.slug)
    if (!cert) return response.notFound({ message: 'Certification not found' })
    const data = await updateCertificationValidator.validate(request.body())
    cert.merge({ ...data, tags: data.tags ?? cert.tags })
    await cert.save()
    return response.ok({ slug: cert.slug })
  }

  async destroy({ params, response }: HttpContext) {
    const cert = await Certification.findBy('slug', params.slug)
    if (!cert) return response.notFound({ message: 'Certification not found' })
    await cert.delete()
    return response.noContent()
  }
}
