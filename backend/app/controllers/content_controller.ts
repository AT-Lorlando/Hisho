import type { HttpContext } from '@adonisjs/core/http'
import ContentService, { isValidContentType } from '#services/content_service'
import { createContentValidator, updateContentValidator } from '#validators/content'

const contentService = new ContentService()

export default class ContentController {
  async store({ params, request, response }: HttpContext) {
    if (!isValidContentType(params.type)) {
      return response.badRequest({ message: `Invalid content type: ${params.type}` })
    }

    const { body, ...frontmatter } = await request.validateUsing(createContentValidator)
    const slug = contentService.generateSlug(frontmatter.title as string)

    if (contentService.exists(params.type, slug)) {
      return response.conflict({ message: `Un fichier avec le slug "${slug}" existe déjà` })
    }

    contentService.write(params.type, slug, { ...frontmatter, slug }, body ?? '')
    return response.created({ slug })
  }

  async update({ params, request, response }: HttpContext) {
    if (!isValidContentType(params.type)) {
      return response.badRequest({ message: `Invalid content type: ${params.type}` })
    }

    if (!/^[a-z0-9-]+$/.test(params.slug)) {
      return response.badRequest({ message: 'Invalid slug' })
    }

    if (!contentService.exists(params.type, params.slug)) {
      return response.notFound({ message: `Fichier "${params.slug}" introuvable` })
    }

    const { body, ...frontmatter } = await request.validateUsing(updateContentValidator)
    contentService.write(params.type, params.slug, { ...frontmatter, slug: params.slug }, body ?? '')
    return response.ok({ slug: params.slug })
  }

  async destroy({ params, response }: HttpContext) {
    if (!isValidContentType(params.type)) {
      return response.badRequest({ message: `Invalid content type: ${params.type}` })
    }

    if (!/^[a-z0-9-]+$/.test(params.slug)) {
      return response.badRequest({ message: 'Invalid slug' })
    }

    if (!contentService.exists(params.type, params.slug)) {
      return response.notFound({ message: `Fichier "${params.slug}" introuvable` })
    }

    contentService.delete(params.type, params.slug)
    return response.noContent()
  }
}
