import type { HttpContext } from '@adonisjs/core/http'
import CompetencyRating from '#models/competency_rating'
import { updateCompetencyValidator } from '#validators/competency'

const VALID_TYPES = ['skill', 'domain'] as const
type CompetencyType = (typeof VALID_TYPES)[number]

function isValidType(t: string): t is CompetencyType {
  return (VALID_TYPES as readonly string[]).includes(t)
}

export default class CompetencyController {
  async index({ auth, response }: HttpContext) {
    const user = await auth.getUserOrFail()
    const ratings = await CompetencyRating.query().where('userId', user.id)

    const result: { skills: Record<string, number>; domains: Record<string, number> } = {
      skills: {},
      domains: {},
    }

    for (const rating of ratings) {
      if (rating.type === 'skill') {
        result.skills[rating.slug] = rating.level
      } else {
        result.domains[rating.slug] = rating.level
      }
    }

    return response.ok(result)
  }

  async upsert({ auth, params, request, response }: HttpContext) {
    const user = await auth.getUserOrFail()

    if (!isValidType(params.type)) {
      return response.badRequest({
        message: `Invalid type: ${params.type}. Must be skill or domain.`,
      })
    }

    const { level } = await request.validateUsing(updateCompetencyValidator)

    await CompetencyRating.updateOrCreate(
      { userId: user.id, type: params.type, slug: params.slug },
      { level }
    )

    return response.ok({ type: params.type, slug: params.slug, level })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = await auth.getUserOrFail()

    if (!isValidType(params.type)) {
      return response.badRequest({
        message: `Invalid type: ${params.type}. Must be skill or domain.`,
      })
    }

    const rating = await CompetencyRating.query()
      .where('userId', user.id)
      .where('type', params.type)
      .where('slug', params.slug)
      .first()

    if (!rating) {
      return response.notFound({ message: 'Rating not found' })
    }

    await rating.delete()
    return response.noContent()
  }
}
