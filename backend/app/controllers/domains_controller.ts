import type { HttpContext } from '@adonisjs/core/http'
import Domain from '#models/domain'
import { createDomainValidator, updateDomainValidator } from '#validators/domains'
import { generateSlug } from '../utils/slug.js'

export default class DomainsController {
  async index({ auth, response }: HttpContext) {
    const domains = await Domain.query()
      .where('userId', auth.user!.id)
      .orderBy('title', 'asc')
    return response.ok(domains.map((d) => d.serialize()))
  }

  async show({ auth, params, response }: HttpContext) {
    const domain = await Domain.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!domain) return response.notFound({ message: 'Domain not found' })
    return response.ok(domain.serialize())
  }

  async store({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const data = await createDomainValidator.validate(request.body())
    const slug = generateSlug(data.title)
    const exists = await Domain.query().where('userId', userId).where('slug', slug).first()
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const domain = await Domain.create({ ...data, slug, userId })
    return response.created({ slug: domain.slug })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const domain = await Domain.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!domain) return response.notFound({ message: 'Domain not found' })
    const data = await updateDomainValidator.validate(request.body())
    domain.merge(data)
    await domain.save()
    return response.ok({ slug: domain.slug })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const domain = await Domain.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!domain) return response.notFound({ message: 'Domain not found' })
    await domain.delete()
    return response.noContent()
  }
}
