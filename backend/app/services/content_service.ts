import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import env from '#start/env'

export const VALID_CONTENT_TYPES = ['experiences', 'skills', 'projects', 'certifications'] as const
export type ContentType = (typeof VALID_CONTENT_TYPES)[number]

export function isValidContentType(type: string): type is ContentType {
  return (VALID_CONTENT_TYPES as readonly string[]).includes(type)
}

export default class ContentService {
  private contentDir: string

  constructor() {
    const configured = env.get('CONTENT_DIR')
    this.contentDir = configured
      ? resolve(process.cwd(), configured)
      : resolve(process.cwd(), '..', 'frontend', 'content')
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  private filePath(type: ContentType, slug: string): string {
    return join(this.contentDir, type, `${slug}.md`)
  }

  exists(type: ContentType, slug: string): boolean {
    return existsSync(this.filePath(type, slug))
  }

  read(type: ContentType, slug: string): { frontmatter: Record<string, unknown>; body: string } {
    const raw = readFileSync(this.filePath(type, slug), 'utf-8')
    const { data, content } = matter(raw)
    return { frontmatter: data, body: content.trim() }
  }

  write(
    type: ContentType,
    slug: string,
    frontmatter: Record<string, unknown>,
    body: string
  ): void {
    const dir = join(this.contentDir, type)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(this.filePath(type, slug), matter.stringify(body, frontmatter), 'utf-8')
  }

  delete(type: ContentType, slug: string): void {
    unlinkSync(this.filePath(type, slug))
  }
}
