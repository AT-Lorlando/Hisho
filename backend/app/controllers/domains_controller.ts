import type { HttpContext } from '@adonisjs/core/http'
import Domain from '#models/domain'
import { createDomainValidator, updateDomainValidator } from '#validators/domains'
import { generateSlug } from '../utils/slug.js'

export default class DomainsController {
  async index({ response }: HttpContext) {
    const domains = await Domain.query().orderBy('title', 'asc')
    return response.ok(domains.map((d) => d.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const domain = await Domain.findBy('slug', params.slug)
    if (!domain) return response.notFound({ message: 'Domain not found' })
    return response.ok(domain.serialize())
  }

  async store({ request, response }: HttpContext) {
    const data = await createDomainValidator.validate(request.body())
    const slug = generateSlug(data.title)
    const exists = await Domain.findBy('slug', slug)
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const domain = await Domain.create({ ...data, slug })
    return response.created({ slug: domain.slug })
  }

  async update({ params, request, response }: HttpContext) {
    const domain = await Domain.findBy('slug', params.slug)
    if (!domain) return response.notFound({ message: 'Domain not found' })
    const data = await updateDomainValidator.validate(request.body())
    domain.merge(data)
    await domain.save()
    return response.ok({ slug: domain.slug })
  }

  async destroy({ params, response }: HttpContext) {
    const domain = await Domain.findBy('slug', params.slug)
    if (!domain) return response.notFound({ message: 'Domain not found' })
    await domain.delete()
    return response.noContent()
  }
}
