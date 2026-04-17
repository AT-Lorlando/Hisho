import type { HttpContext } from '@adonisjs/core/http'
import Skill from '#models/skill'
import { createSkillValidator, updateSkillValidator } from '#validators/skills'
import { generateSlug } from '../utils/slug.js'

export default class SkillsController {
  async index({ response }: HttpContext) {
    const skills = await Skill.query().orderBy('title', 'asc')
    return response.ok(skills.map((s) => s.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const skill = await Skill.findBy('slug', params.slug)
    if (!skill) return response.notFound({ message: 'Skill not found' })
    return response.ok(skill.serialize())
  }

  async store({ request, response }: HttpContext) {
    const data = await createSkillValidator.validate(request.body())
    const slug = generateSlug(data.title)
    const exists = await Skill.findBy('slug', slug)
    if (exists) return response.conflict({ message: `Slug "${slug}" already exists` })
    const skill = await Skill.create({ ...data, slug })
    return response.created({ slug: skill.slug })
  }

  async update({ params, request, response }: HttpContext) {
    const skill = await Skill.findBy('slug', params.slug)
    if (!skill) return response.notFound({ message: 'Skill not found' })
    const data = await updateSkillValidator.validate(request.body())
    skill.merge(data)
    await skill.save()
    return response.ok({ slug: skill.slug })
  }

  async destroy({ params, response }: HttpContext) {
    const skill = await Skill.findBy('slug', params.slug)
    if (!skill) return response.notFound({ message: 'Skill not found' })
    await skill.delete()
    return response.noContent()
  }
}
