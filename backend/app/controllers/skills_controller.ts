import type { HttpContext } from '@adonisjs/core/http'
import Skill from '#models/skill'
import Domain from '#models/domain'
import { createSkillValidator, updateSkillValidator } from '#validators/skills'
import { generateSlug } from '../utils/slug.js'

function serializeSkill(skill: Skill) {
  return {
    id: skill.id,
    slug: skill.slug,
    title: skill.title,
    domain: skill.domain ? { slug: skill.domain.slug, title: skill.domain.title } : null,
    yearsOfExperience: skill.yearsOfExperience,
    aiSummary: skill.aiSummary,
    body: skill.body,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }
}

async function resolveDomainId(domainSlug: string | undefined, userId: number): Promise<number | null> {
  if (!domainSlug) return null
  const domain = await Domain.query().where('userId', userId).where('slug', domainSlug).first()
  return domain?.id ?? null
}

export default class SkillsController {
  async index({ auth, response }: HttpContext) {
    const skills = await Skill.query()
      .where('userId', auth.user!.id)
      .preload('domain')
      .orderBy('title', 'asc')
    return response.ok(skills.map(serializeSkill))
  }

  async show({ auth, params, response }: HttpContext) {
    const skill = await Skill.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .preload('domain')
      .first()
    if (!skill) return response.notFound({ message: 'Skill not found' })
    return response.ok(serializeSkill(skill))
  }

  async store({ auth, request, response }: HttpContext) {
    const userId = auth.user!.id
    const { domainSlug, ...rest } = await createSkillValidator.validate(request.body())
    const slug = generateSlug(rest.title)
    const exists = await Skill.query().where('userId', userId).where('slug', slug).first()
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const domainId = await resolveDomainId(domainSlug, userId)
    const skill = await Skill.create({ ...rest, slug, domainId, userId })
    await skill.load('domain')
    return response.created({ slug: skill.slug })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const userId = auth.user!.id
    const skill = await Skill.query().where('userId', userId).where('slug', params.slug).first()
    if (!skill) return response.notFound({ message: 'Skill not found' })
    const { domainSlug, ...rest } = await updateSkillValidator.validate(request.body())
    const domainId = await resolveDomainId(domainSlug, userId)
    skill.merge({ ...rest, domainId })
    await skill.save()
    return response.ok({ slug: skill.slug })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const skill = await Skill.query()
      .where('userId', auth.user!.id)
      .where('slug', params.slug)
      .first()
    if (!skill) return response.notFound({ message: 'Skill not found' })
    await skill.delete()
    return response.noContent()
  }
}
