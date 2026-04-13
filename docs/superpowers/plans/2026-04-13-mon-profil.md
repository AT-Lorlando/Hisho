# Mon Profil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page "Mon Profil" avec sidebar fixe, formulaire d'identité (DB), sections Markdown (expériences, compétences, projets, certifications) en vue liste+aperçu, et pages d'édition dédiées écrivant les fichiers MD via AdonisJS.

**Architecture:** Le frontend Nuxt 4 lit les fichiers Markdown via `queryCollection()` de Nuxt Content v3. Les écritures (create/update/delete) passent par AdonisJS qui sérialise les données en frontmatter YAML + corps Markdown. L'identité est stockée en PostgreSQL sur le modèle `User` étendu.

**Tech Stack:** AdonisJS 6, Nuxt 4, Nuxt Content v3, Vue 3, Pinia, shadcn-vue, gray-matter (npm), TypeScript strict

---

## Carte des fichiers

### Backend — nouveaux fichiers
- `backend/database/migrations/<ts>_add_profile_fields_to_users.ts` — colonnes profil sur users
- `backend/app/models/user.ts` — colonnes supplémentaires (modification)
- `backend/app/services/content_service.ts` — R/W fichiers Markdown
- `backend/app/controllers/profile_controller.ts` — GET/PUT /profile
- `backend/app/controllers/content_controller.ts` — POST/PUT/DELETE /content/:type/:slug
- `backend/app/validators/profile.ts` — validation profil
- `backend/app/validators/content.ts` — validation contenu MD
- `backend/start/routes.ts` — ajout routes (modification)
- `backend/start/env.ts` — ajout CONTENT_DIR (modification)
- `backend/tests/functional/profile.spec.ts` — tests profile
- `backend/tests/functional/content.spec.ts` — tests content

### Frontend — nouveaux fichiers
- `frontend/content.config.ts` — définition des collections Nuxt Content
- `frontend/content/experiences/.gitkeep` — dossier versionné
- `frontend/content/skills/.gitkeep`
- `frontend/content/projects/.gitkeep`
- `frontend/content/certifications/.gitkeep`
- `frontend/app/types/content.ts` — interfaces TypeScript partagées
- `frontend/app/composables/useProfile.ts`
- `frontend/app/composables/useContent.ts`
- `frontend/app/composables/useContentCounts.ts`
- `frontend/app/composables/useContentFile.ts`
- `frontend/app/layouts/profile.vue`
- `frontend/app/components/profile/ProfileSidebar.vue`
- `frontend/app/components/profile/IdentityForm.vue`
- `frontend/app/components/profile/CompileButton.vue`
- `frontend/app/components/content/ContentSplitView.vue`
- `frontend/app/components/content/ContentListItem.vue`
- `frontend/app/components/content/ContentPreview.vue`
- `frontend/app/components/content/ExperienceForm.vue`
- `frontend/app/components/content/SkillForm.vue`
- `frontend/app/components/content/ProjectForm.vue`
- `frontend/app/components/content/CertificationForm.vue`
- `frontend/app/pages/profile/index.vue` — redirect
- `frontend/app/pages/profile/identity.vue`
- `frontend/app/pages/profile/experiences/index.vue`
- `frontend/app/pages/profile/experiences/new.vue`
- `frontend/app/pages/profile/experiences/edit/[slug].vue`
- `frontend/app/pages/profile/skills/index.vue`
- `frontend/app/pages/profile/skills/new.vue`
- `frontend/app/pages/profile/skills/edit/[slug].vue`
- `frontend/app/pages/profile/projects/index.vue`
- `frontend/app/pages/profile/projects/new.vue`
- `frontend/app/pages/profile/projects/edit/[slug].vue`
- `frontend/app/pages/profile/certifications/index.vue`
- `frontend/app/pages/profile/certifications/new.vue`
- `frontend/app/pages/profile/certifications/edit/[slug].vue`

### Frontend — fichiers modifiés
- `frontend/nuxt.config.ts` — ajout module @nuxt/content
- `frontend/package.json` — ajout @nuxt/content

---

## Task 1 — Installation des dépendances et répertoire content

**Files:**
- Create: `frontend/content/experiences/.gitkeep`
- Create: `frontend/content/skills/.gitkeep`
- Create: `frontend/content/projects/.gitkeep`
- Create: `frontend/content/certifications/.gitkeep`
- Modify: `frontend/package.json`
- Create: `backend/package.json` (ajout gray-matter)

- [ ] **Installer @nuxt/content dans le frontend**

```bash
cd frontend && npm install @nuxt/content
```

Expected: `@nuxt/content` apparaît dans `package.json` dependencies.

- [ ] **Installer gray-matter dans le backend**

```bash
cd backend && npm install gray-matter && npm install --save-dev @types/gray-matter
```

Expected: `gray-matter` apparaît dans `backend/package.json` dependencies.

- [ ] **Créer la structure des dossiers content**

```bash
mkdir -p frontend/content/experiences frontend/content/skills frontend/content/projects frontend/content/certifications
touch frontend/content/experiences/.gitkeep frontend/content/skills/.gitkeep frontend/content/projects/.gitkeep frontend/content/certifications/.gitkeep
```

- [ ] **Créer un fichier d'exemple pour tester Nuxt Content**

Créer `frontend/content/experiences/dev-fullstack-acme.md` :

```markdown
---
title: "Développeur Full-Stack — Acme Corp"
client: "Acme Corp"
role: "Développeur Full-Stack Senior"
type: "mission"
startDate: "2024-01"
endDate: "2024-06"
location: "Paris (hybride)"
stack:
  - TypeScript
  - Nuxt 3
  - AdonisJS
tags:
  - fullstack
  - api-rest
highlights:
  - "Refonte complète de l'interface en Nuxt 3"
  - "Mise en place API REST avec authentification session"
  - "Réduction de 40% du temps de chargement"
aiSummary: ""
---

Mission de refonte complète sur 6 mois. Contexte e-commerce B2B, 50k utilisateurs actifs.
```

- [ ] **Commit**

```bash
git add frontend/content/ frontend/package.json frontend/package-lock.json backend/package.json backend/package-lock.json
git commit -m "chore: install @nuxt/content and gray-matter, scaffold content directories"
```

---

## Task 2 — Types TypeScript partagés

**Files:**
- Create: `frontend/app/types/content.ts`

- [ ] **Créer les interfaces TypeScript**

Créer `frontend/app/types/content.ts` :

```typescript
export interface Experience {
  _path: string
  slug: string
  title: string
  client: string
  role: string
  type: 'mission' | 'emploi' | 'freelance'
  startDate: string
  endDate?: string
  location?: string
  stack: string[]
  tags: string[]
  highlights: string[]
  aiSummary?: string
  body?: string
}

export interface Skill {
  _path: string
  slug: string
  title: string
  category: string
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'expert'
  tags: string[]
  yearsOfExperience?: number
  lastUsed?: string
  contexts?: string
  aiSummary?: string
  body?: string
}

export interface Project {
  _path: string
  slug: string
  title: string
  type: 'personnel' | 'professionnel' | 'open-source'
  status: 'en-cours' | 'terminé' | 'abandonné'
  startDate?: string
  endDate?: string
  stack: string[]
  tags: string[]
  url?: string
  demo?: string
  aiSummary?: string
  body?: string
}

export interface Certification {
  _path: string
  slug: string
  title: string
  organism: string
  date: string
  expiry?: string
  credentialId?: string
  url?: string
  tags: string[]
  aiSummary?: string
  body?: string
}

export interface UserProfile {
  id: number
  email: string
  fullName: string | null
  title: string | null
  bio: string | null
  location: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  websiteUrl: string | null
  phone: string | null
  availability: string | null
  dailyRate: string | null
  lastCompiledAt: string | null
}

export type ContentType = 'experiences' | 'skills' | 'projects' | 'certifications'

export interface ContentCounts {
  experiences: number
  skills: number
  projects: number
  certifications: number
}

// Payload envoyé au backend pour créer/modifier un fichier MD
export interface ExperiencePayload {
  title: string
  client: string
  role: string
  type: 'mission' | 'emploi' | 'freelance'
  startDate: string
  endDate?: string
  location?: string
  stack: string[]
  tags: string[]
  highlights: string[]
  body?: string
}

export interface SkillPayload {
  title: string
  category: string
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'expert'
  tags: string[]
  yearsOfExperience?: number
  lastUsed?: string
  contexts?: string
  body?: string
}

export interface ProjectPayload {
  title: string
  type: 'personnel' | 'professionnel' | 'open-source'
  status: 'en-cours' | 'terminé' | 'abandonné'
  startDate?: string
  endDate?: string
  stack: string[]
  tags: string[]
  url?: string
  demo?: string
  body?: string
}

export interface CertificationPayload {
  title: string
  organism: string
  date: string
  expiry?: string
  credentialId?: string
  url?: string
  tags: string[]
  body?: string
}
```

- [ ] **Commit**

```bash
git add frontend/app/types/content.ts
git commit -m "feat: add TypeScript content types"
```

---

## Task 3 — Migration DB et User model

**Files:**
- Create: `backend/database/migrations/<timestamp>_add_profile_fields_to_users.ts`
- Modify: `backend/app/models/user.ts`

- [ ] **Générer la migration**

```bash
cd backend && node ace make:migration add_profile_fields_to_users
```

- [ ] **Écrire le contenu de la migration**

Ouvrir le fichier généré dans `backend/database/migrations/` (celui qui se termine par `_add_profile_fields_to_users.ts`) et le remplacer par :

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('title').nullable()
      table.text('bio').nullable()
      table.string('location').nullable()
      table.string('linkedin_url').nullable()
      table.string('github_url').nullable()
      table.string('website_url').nullable()
      table.string('phone').nullable()
      table.string('availability').nullable()
      table.string('daily_rate').nullable()
      table.timestamp('last_compiled_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title')
      table.dropColumn('bio')
      table.dropColumn('location')
      table.dropColumn('linkedin_url')
      table.dropColumn('github_url')
      table.dropColumn('website_url')
      table.dropColumn('phone')
      table.dropColumn('availability')
      table.dropColumn('daily_rate')
      table.dropColumn('last_compiled_at')
    })
  }
}
```

- [ ] **Mettre à jour le modèle User**

Remplacer le contenu de `backend/app/models/user.ts` par :

```typescript
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  // Champs profil
  @column()
  declare title: string | null

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare linkedinUrl: string | null

  @column()
  declare githubUrl: string | null

  @column()
  declare websiteUrl: string | null

  @column()
  declare phone: string | null

  @column()
  declare availability: string | null

  @column()
  declare dailyRate: string | null

  @column.dateTime()
  declare lastCompiledAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
```

- [ ] **Exécuter la migration**

```bash
cd backend && node ace migration:run
```

Expected: `Migrated: database/migrations/<ts>_add_profile_fields_to_users`

- [ ] **Commit**

```bash
git add backend/database/migrations/ backend/app/models/user.ts
git commit -m "feat(backend): add profile fields to users table"
```

---

## Task 4 — ContentService (lecture/écriture des fichiers MD)

**Files:**
- Modify: `backend/start/env.ts`
- Create: `backend/app/services/content_service.ts`

- [ ] **Ajouter CONTENT_DIR dans la validation d'env**

Dans `backend/start/env.ts`, ajouter dans l'objet du schema :

```typescript
  CONTENT_DIR: Env.schema.string.optional(),
```

- [ ] **Ajouter CONTENT_DIR dans backend/.env**

Dans `backend/.env` (créer si absent) ajouter :

```env
CONTENT_DIR=../frontend/content
```

- [ ] **Créer ContentService**

Créer `backend/app/services/content_service.ts` :

```typescript
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
```

- [ ] **Écrire le test unitaire de ContentService**

Créer `backend/tests/unit/content_service.spec.ts` :

```typescript
import { test } from '@japa/runner'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import ContentService from '#services/content_service'

const TMP_DIR = join(process.cwd(), 'tests', '_content_tmp')

test.group('ContentService', (group) => {
  let service: ContentService

  group.setup(() => {
    mkdirSync(TMP_DIR, { recursive: true })
    process.env.CONTENT_DIR = TMP_DIR
    service = new ContentService()
  })

  group.teardown(() => {
    rmSync(TMP_DIR, { recursive: true, force: true })
    delete process.env.CONTENT_DIR
  })

  test('generateSlug removes accents and special chars', ({ assert }) => {
    assert.equal(service.generateSlug('Développeur Full-Stack'), 'developpeur-full-stack')
    assert.equal(service.generateSlug('CTO @ Startup!'), 'cto--startup')
  })

  test('write creates file, exists returns true, read parses it back', ({ assert }) => {
    const frontmatter = { title: 'Test', client: 'ACME', stack: ['TypeScript'] }
    service.write('experiences', 'test-exp', frontmatter, 'Body content')

    assert.isTrue(service.exists('experiences', 'test-exp'))

    const { frontmatter: fm, body } = service.read('experiences', 'test-exp')
    assert.equal(fm.title, 'Test')
    assert.equal(fm.client, 'ACME')
    assert.deepEqual(fm.stack, ['TypeScript'])
    assert.equal(body, 'Body content')
  })

  test('delete removes file', ({ assert }) => {
    service.write('experiences', 'to-delete', { title: 'Del' }, '')
    assert.isTrue(service.exists('experiences', 'to-delete'))
    service.delete('experiences', 'to-delete')
    assert.isFalse(service.exists('experiences', 'to-delete'))
  })

  test('exists returns false for unknown file', ({ assert }) => {
    assert.isFalse(service.exists('experiences', 'nonexistent'))
  })
})
```

- [ ] **Lancer le test unitaire**

```bash
cd backend && node ace test -- --files=tests/unit/content_service.spec.ts
```

Expected: `4 passed`

- [ ] **Commit**

```bash
git add backend/start/env.ts backend/app/services/content_service.ts backend/tests/unit/content_service.spec.ts
git commit -m "feat(backend): add ContentService for markdown file read/write"
```

---

## Task 5 — ProfileController et validator

**Files:**
- Create: `backend/app/validators/profile.ts`
- Create: `backend/app/controllers/profile_controller.ts`
- Create: `backend/tests/functional/profile.spec.ts`

- [ ] **Créer le validator du profil**

Créer `backend/app/validators/profile.ts` :

```typescript
import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    title: vine.string().trim().optional(),
    bio: vine.string().trim().optional(),
    location: vine.string().trim().optional(),
    linkedinUrl: vine.string().trim().url().optional(),
    githubUrl: vine.string().trim().url().optional(),
    websiteUrl: vine.string().trim().url().optional(),
    phone: vine.string().trim().optional(),
    availability: vine.string().trim().optional(),
    dailyRate: vine.string().trim().optional(),
  })
)
```

- [ ] **Créer le ProfileController**

Créer `backend/app/controllers/profile_controller.ts` :

```typescript
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
```

- [ ] **Écrire les tests fonctionnels du profil**

Créer `backend/tests/functional/profile.spec.ts` :

```typescript
import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('ProfileController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /profile returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.get('/profile')
    response.assertStatus(401)
  })

  test('GET /profile returns current user profile', async ({ client }) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    const response = await client.get('/profile').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ email: 'test@example.com', fullName: 'Test User' })
  })

  test('PUT /profile updates profile fields', async ({ client, assert }) => {
    const user = await User.create({
      email: 'test2@example.com',
      password: 'password123',
    })

    const response = await client
      .put('/profile')
      .loginAs(user)
      .json({
        title: 'Développeur Full-Stack',
        bio: 'Passionné de TypeScript',
        location: 'Paris',
        availability: 'Disponible',
      })

    response.assertStatus(200)
    response.assertBodyContains({
      title: 'Développeur Full-Stack',
      bio: 'Passionné de TypeScript',
      location: 'Paris',
    })

    await user.refresh()
    assert.equal(user.title, 'Développeur Full-Stack')
  })

  test('PUT /profile returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.put('/profile').json({ title: 'Test' })
    response.assertStatus(401)
  })
})
```

- [ ] **Lancer les tests (ils doivent échouer — routes pas encore câblées)**

```bash
cd backend && node ace test -- --files=tests/functional/profile.spec.ts
```

Expected: FAIL — `404 Not Found` (routes inexistantes)

- [ ] **Commit**

```bash
git add backend/app/validators/profile.ts backend/app/controllers/profile_controller.ts backend/tests/functional/profile.spec.ts
git commit -m "feat(backend): add ProfileController and validator"
```

---

## Task 6 — ContentController et validator

**Files:**
- Create: `backend/app/validators/content.ts`
- Create: `backend/app/controllers/content_controller.ts`
- Create: `backend/tests/functional/content.spec.ts`

- [ ] **Créer le validator de contenu**

Créer `backend/app/validators/content.ts` :

```typescript
import vine from '@vinejs/vine'

export const createContentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().optional(),
  }).allowUnknownProperties()
)

export const updateContentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().optional(),
  }).allowUnknownProperties()
)
```

- [ ] **Créer le ContentController**

Créer `backend/app/controllers/content_controller.ts` :

```typescript
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

    if (!contentService.exists(params.type, params.slug)) {
      return response.notFound({ message: `Fichier "${params.slug}" introuvable` })
    }

    contentService.delete(params.type, params.slug)
    return response.noContent()
  }
}
```

- [ ] **Écrire les tests fonctionnels du content**

Créer `backend/tests/functional/content.spec.ts` :

```typescript
import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const TMP_DIR = join(process.cwd(), 'tests', '_content_tmp_functional')

test.group('ContentController', (group) => {
  group.setup(() => {
    mkdirSync(TMP_DIR, { recursive: true })
    process.env.CONTENT_DIR = TMP_DIR
  })

  group.teardown(() => {
    rmSync(TMP_DIR, { recursive: true, force: true })
    delete process.env.CONTENT_DIR
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `u${Date.now()}@test.com`, password: 'password123' })
  }

  test('POST /content/:type returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.post('/content/experiences').json({ title: 'Test' })
    response.assertStatus(401)
  })

  test('POST /content/experiences creates a markdown file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/experiences')
      .loginAs(user)
      .json({
        title: 'Dev TypeScript',
        client: 'TestCorp',
        role: 'Développeur',
        startDate: '2024-01',
        stack: ['TypeScript'],
        tags: ['frontend'],
        highlights: ['Built stuff'],
        body: 'Description de la mission.',
      })

    response.assertStatus(201)
    response.assertBodyContains({ slug: 'dev-typescript' })
  })

  test('POST /content/:type returns 400 for invalid type', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/invalid-type')
      .loginAs(user)
      .json({ title: 'Test' })
    response.assertStatus(400)
  })

  test('PUT /content/:type/:slug updates existing file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/skills')
      .loginAs(user)
      .json({ title: 'TypeScript', category: 'Langage', level: 'expert', tags: [] })

    const response = await client
      .put('/content/skills/typescript')
      .loginAs(user)
      .json({ title: 'TypeScript', category: 'Langage', level: 'avancé', tags: ['frontend'] })

    response.assertStatus(200)
    response.assertBodyContains({ slug: 'typescript' })
  })

  test('DELETE /content/:type/:slug removes file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/projects')
      .loginAs(user)
      .json({ title: 'Mon Projet', type: 'personnel', status: 'en-cours', stack: [], tags: [] })

    const response = await client
      .delete('/content/projects/mon-projet')
      .loginAs(user)
    response.assertStatus(204)
  })

  test('DELETE /content/:type/:slug returns 404 for unknown slug', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .delete('/content/experiences/nonexistent-slug')
      .loginAs(user)
    response.assertStatus(404)
  })
})
```

- [ ] **Commit**

```bash
git add backend/app/validators/content.ts backend/app/controllers/content_controller.ts backend/tests/functional/content.spec.ts
git commit -m "feat(backend): add ContentController and validator"
```

---

## Task 7 — Câblage des routes backend

**Files:**
- Modify: `backend/start/routes.ts`

- [ ] **Ajouter les routes profile et content**

Remplacer le contenu de `backend/start/routes.ts` par :

```typescript
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')
const ContentController = () => import('#controllers/content_controller')

router.get('/', async () => ({ hello: 'world' }))

/**
 * Auth routes
 */
router
  .group(() => {
    router.post('/register', [AuthController, 'register']).use(middleware.guest())
    router.post('/login', [AuthController, 'login']).use(middleware.guest())
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/auth')

/**
 * Profile routes — require auth
 */
router
  .group(() => {
    router.get('/profile', [ProfileController, 'show'])
    router.put('/profile', [ProfileController, 'update'])
    router.post('/profile/compile', [ProfileController, 'compile'])
  })
  .use(middleware.auth())

/**
 * Content (Markdown files) routes — require auth
 */
router
  .group(() => {
    router.post('/content/:type', [ContentController, 'store'])
    router.put('/content/:type/:slug', [ContentController, 'update'])
    router.delete('/content/:type/:slug', [ContentController, 'destroy'])
  })
  .use(middleware.auth())
```

- [ ] **Lancer tous les tests backend**

```bash
cd backend && node ace test
```

Expected: tous les tests passent — unit + functional profile + functional content

- [ ] **Commit**

```bash
git add backend/start/routes.ts
git commit -m "feat(backend): wire profile and content routes"
```

---

## Task 8 — Configuration Nuxt Content v3

**Files:**
- Modify: `frontend/nuxt.config.ts`
- Create: `frontend/content.config.ts`

- [ ] **Ajouter @nuxt/content dans nuxt.config.ts**

Remplacer `frontend/nuxt.config.ts` par :

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
const env = dotenv.config()

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/ui', 'shadcn-nuxt', '@nuxt/icon', '@pinia/nuxt'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  routeRules: {
    '/api/v1/**': { proxy: `${env.parsed?.API_URL}/**` }
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  icon: {
    serverBundle: {
      collections: ['uil', 'lucide']
    }
  }
})
```

- [ ] **Créer content.config.ts**

Créer `frontend/content.config.ts` :

```typescript
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    experiences: defineCollection({
      type: 'page',
      source: 'experiences/*.md',
      schema: z.object({
        title: z.string(),
        client: z.string(),
        role: z.string(),
        type: z.enum(['mission', 'emploi', 'freelance']),
        startDate: z.string(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        stack: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        highlights: z.array(z.string()).default([]),
        aiSummary: z.string().optional(),
      }),
    }),
    skills: defineCollection({
      type: 'page',
      source: 'skills/*.md',
      schema: z.object({
        title: z.string(),
        category: z.string(),
        level: z.enum(['débutant', 'intermédiaire', 'avancé', 'expert']),
        tags: z.array(z.string()).default([]),
        yearsOfExperience: z.number().optional(),
        lastUsed: z.string().optional(),
        contexts: z.string().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        type: z.enum(['personnel', 'professionnel', 'open-source']),
        status: z.enum(['en-cours', 'terminé', 'abandonné']),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        stack: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        url: z.string().optional(),
        demo: z.string().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    certifications: defineCollection({
      type: 'page',
      source: 'certifications/*.md',
      schema: z.object({
        title: z.string(),
        organism: z.string(),
        date: z.string(),
        expiry: z.string().optional(),
        credentialId: z.string().optional(),
        url: z.string().optional(),
        tags: z.array(z.string()).default([]),
        aiSummary: z.string().optional(),
      }),
    }),
  },
})
```

- [ ] **Vérifier que le dev server démarre sans erreur**

```bash
cd frontend && npm run dev
```

Expected: serveur démarre sur http://localhost:3000, pas d'erreur console liée à @nuxt/content.

- [ ] **Commit**

```bash
git add frontend/nuxt.config.ts frontend/content.config.ts frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): configure Nuxt Content v3 with collections"
```

---

## Task 9 — Composables frontend

**Files:**
- Create: `frontend/app/composables/useProfile.ts`
- Create: `frontend/app/composables/useContent.ts`
- Create: `frontend/app/composables/useContentCounts.ts`
- Create: `frontend/app/composables/useContentFile.ts`

- [ ] **Créer useProfile.ts**

Créer `frontend/app/composables/useProfile.ts` :

```typescript
import type { UserProfile } from '~/types/content'

export function useProfile() {
  const profile = useState<UserProfile | null>('profile', () => null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<UserProfile>('/api/v1/profile')
      profile.value = data
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function update(data: Partial<UserProfile>) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await $fetch<UserProfile>('/api/v1/profile', {
        method: 'PUT',
        body: data,
      })
      profile.value = updated
      return updated
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function compile() {
    return $fetch('/api/v1/profile/compile', { method: 'POST' })
  }

  return { profile, isLoading, error, fetch, update, compile }
}
```

- [ ] **Créer useContent.ts**

Créer `frontend/app/composables/useContent.ts` :

```typescript
import type { ContentType, Experience, Skill, Project, Certification } from '~/types/content'

type CollectionItem = Experience | Skill | Project | Certification

export function useContent<T extends CollectionItem>(type: ContentType) {
  const { data: items, refresh } = useAsyncData<T[]>(
    `content-${type}`,
    () => queryCollection(type as any).all() as Promise<T[]>,
    { default: () => [] }
  )

  const count = computed(() => items.value?.length ?? 0)

  return { items, count, refresh }
}
```

- [ ] **Créer useContentCounts.ts**

Créer `frontend/app/composables/useContentCounts.ts` :

```typescript
import type { ContentCounts } from '~/types/content'

export function useContentCounts() {
  const { data: counts } = useAsyncData<ContentCounts>(
    'content-counts',
    async () => {
      const [exp, skills, projects, certs] = await Promise.all([
        queryCollection('experiences').count(),
        queryCollection('skills').count(),
        queryCollection('projects').count(),
        queryCollection('certifications').count(),
      ])
      return { experiences: exp, skills, projects, certifications: certs }
    },
    { default: () => ({ experiences: 0, skills: 0, projects: 0, certifications: 0 }) }
  )

  return counts
}
```

- [ ] **Créer useContentFile.ts**

Créer `frontend/app/composables/useContentFile.ts` :

```typescript
import type { ContentType } from '~/types/content'

export function useContentFile(type: ContentType) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function create(data: Record<string, unknown>): Promise<{ slug: string }> {
    isLoading.value = true
    error.value = null
    try {
      return await $fetch<{ slug: string }>(`/api/v1/content/${type}`, {
        method: 'POST',
        body: data,
      })
    } catch (e: any) {
      error.value = e.data?.message ?? e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function update(slug: string, data: Record<string, unknown>): Promise<{ slug: string }> {
    isLoading.value = true
    error.value = null
    try {
      return await $fetch<{ slug: string }>(`/api/v1/content/${type}/${slug}`, {
        method: 'PUT',
        body: data,
      })
    } catch (e: any) {
      error.value = e.data?.message ?? e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function remove(slug: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/v1/content/${type}/${slug}`, { method: 'DELETE' })
    } catch (e: any) {
      error.value = e.data?.message ?? e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, create, update, remove }
}
```

- [ ] **Commit**

```bash
git add frontend/app/composables/
git commit -m "feat(frontend): add useProfile, useContent, useContentCounts, useContentFile composables"
```

---

## Task 10 — Layout profil et sidebar

**Files:**
- Create: `frontend/app/layouts/profile.vue`
- Create: `frontend/app/components/profile/ProfileSidebar.vue`

- [ ] **Créer ProfileSidebar.vue**

Créer `frontend/app/components/profile/ProfileSidebar.vue` :

```vue
<script setup lang="ts">
const route = useRoute()
const counts = useContentCounts()

const sections = [
  { label: 'Identité', path: '/profile/identity', icon: 'lucide:user', key: null },
  { label: 'Expériences', path: '/profile/experiences', icon: 'lucide:briefcase', key: 'experiences' as const },
  { label: 'Compétences', path: '/profile/skills', icon: 'lucide:zap', key: 'skills' as const },
  { label: 'Projets', path: '/profile/projects', icon: 'lucide:rocket', key: 'projects' as const },
  { label: 'Certifications', path: '/profile/certifications', icon: 'lucide:award', key: 'certifications' as const },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="w-52 shrink-0 border-r border-border bg-background flex flex-col py-4 px-2 gap-1">
    <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
      Mon Profil
    </p>
    <NuxtLink
      v-for="section in sections"
      :key="section.path"
      :to="section.path"
      class="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
      :class="isActive(section.path)
        ? 'bg-accent text-accent-foreground font-medium'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'"
    >
      <span class="flex items-center gap-2">
        <Icon :name="section.icon" class="w-4 h-4" />
        {{ section.label }}
      </span>
      <span
        v-if="section.key && counts && (counts as any)[section.key] > 0"
        class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
      >
        {{ (counts as any)[section.key] }}
      </span>
    </NuxtLink>
  </nav>
</template>
```

- [ ] **Créer le layout profile.vue**

Créer `frontend/app/layouts/profile.vue` :

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <ProfileSidebar />
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
```

- [ ] **Créer la page de redirection /profile/index.vue**

Créer `frontend/app/pages/profile/index.vue` :

```vue
<script setup lang="ts">
definePageMeta({ layout: 'profile' })
await navigateTo('/profile/identity', { replace: true })
</script>

<template>
  <div />
</template>
```

- [ ] **Vérifier manuellement**

```bash
cd frontend && npm run dev
```

Aller sur http://localhost:3000/profile — doit rediriger vers `/profile/identity` avec la sidebar visible.

- [ ] **Commit**

```bash
git add frontend/app/layouts/profile.vue frontend/app/components/profile/ProfileSidebar.vue frontend/app/pages/profile/index.vue
git commit -m "feat(frontend): add profile layout and sidebar"
```

---

## Task 11 — Page Identité (IdentityForm + CompileButton)

**Files:**
- Create: `frontend/app/components/profile/IdentityForm.vue`
- Create: `frontend/app/components/profile/CompileButton.vue`
- Create: `frontend/app/pages/profile/identity.vue`

- [ ] **Créer IdentityForm.vue**

Créer `frontend/app/components/profile/IdentityForm.vue` :

```vue
<script setup lang="ts">
import type { UserProfile } from '~/types/content'

const props = defineProps<{ profile: UserProfile | null }>()
const emit = defineEmits<{ submit: [data: Partial<UserProfile>] }>()

const form = reactive({
  fullName: props.profile?.fullName ?? '',
  title: props.profile?.title ?? '',
  bio: props.profile?.bio ?? '',
  location: props.profile?.location ?? '',
  linkedinUrl: props.profile?.linkedinUrl ?? '',
  githubUrl: props.profile?.githubUrl ?? '',
  websiteUrl: props.profile?.websiteUrl ?? '',
  phone: props.profile?.phone ?? '',
  availability: props.profile?.availability ?? '',
  dailyRate: props.profile?.dailyRate ?? '',
})

watch(() => props.profile, (p) => {
  if (!p) return
  Object.assign(form, {
    fullName: p.fullName ?? '',
    title: p.title ?? '',
    bio: p.bio ?? '',
    location: p.location ?? '',
    linkedinUrl: p.linkedinUrl ?? '',
    githubUrl: p.githubUrl ?? '',
    websiteUrl: p.websiteUrl ?? '',
    phone: p.phone ?? '',
    availability: p.availability ?? '',
    dailyRate: p.dailyRate ?? '',
  })
})

const availabilityOptions = ['Disponible', 'En mission', 'À l\'écoute']
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit', { ...form })">
    <!-- Nom + Titre -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="fullName">Nom complet</Label>
        <Input id="fullName" v-model="form.fullName" placeholder="Jean Dupont" />
      </div>
      <div class="space-y-1.5">
        <Label for="title">Titre / Poste actuel</Label>
        <Input id="title" v-model="form.title" placeholder="Développeur Full-Stack Senior" />
      </div>
    </div>

    <!-- Email (read-only) -->
    <div class="space-y-1.5">
      <Label>Email</Label>
      <Input :value="profile?.email" disabled class="opacity-60" />
      <p class="text-xs text-muted-foreground">Modifiable depuis les paramètres du compte.</p>
    </div>

    <!-- Bio -->
    <div class="space-y-1.5">
      <Label for="bio">Bio courte</Label>
      <textarea
        id="bio"
        v-model="form.bio"
        rows="3"
        placeholder="Développeur passionné avec 5 ans d'expérience..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
      />
    </div>

    <!-- Location + Disponibilité + TJM -->
    <div class="grid grid-cols-3 gap-4">
      <div class="space-y-1.5">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Paris, France" />
      </div>
      <div class="space-y-1.5">
        <Label for="availability">Disponibilité</Label>
        <select
          id="availability"
          v-model="form.availability"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— Choisir —</option>
          <option v-for="opt in availabilityOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="dailyRate">TJM (€)</Label>
        <Input id="dailyRate" v-model="form.dailyRate" placeholder="650" />
      </div>
    </div>

    <!-- Liens -->
    <div class="grid grid-cols-3 gap-4">
      <div class="space-y-1.5">
        <Label for="linkedin">LinkedIn</Label>
        <Input id="linkedin" v-model="form.linkedinUrl" placeholder="https://linkedin.com/in/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="github">GitHub</Label>
        <Input id="github" v-model="form.githubUrl" placeholder="https://github.com/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="website">Site web</Label>
        <Input id="website" v-model="form.websiteUrl" placeholder="https://monsite.dev" />
      </div>
    </div>

    <!-- Téléphone -->
    <div class="space-y-1.5">
      <Label for="phone">Téléphone</Label>
      <Input id="phone" v-model="form.phone" placeholder="+33 6 12 34 56 78" class="max-w-xs" />
    </div>

    <div class="flex justify-end">
      <Button type="submit">Sauvegarder</Button>
    </div>
  </form>
</template>
```

- [ ] **Créer CompileButton.vue**

Créer `frontend/app/components/profile/CompileButton.vue` :

```vue
<script setup lang="ts">
import type { UserProfile } from '~/types/content'
import { useContentCounts } from '~/composables/useContentCounts'

const props = defineProps<{ profile: UserProfile | null }>()
const emit = defineEmits<{ compiled: [] }>()

const { compile } = useProfile()
const counts = useContentCounts()
const isCompiling = ref(false)

const totalFiles = computed(() =>
  (counts.value?.experiences ?? 0) +
  (counts.value?.skills ?? 0) +
  (counts.value?.projects ?? 0) +
  (counts.value?.certifications ?? 0)
)

const lastCompiled = computed(() => {
  if (!props.profile?.lastCompiledAt) return 'Jamais'
  return new Date(props.profile.lastCompiledAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
})

async function handleCompile() {
  isCompiling.value = true
  try {
    await compile()
    emit('compiled')
  } finally {
    isCompiling.value = false
  }
}
</script>

<template>
  <div class="border-t border-border pt-6 space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium">État du profil</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ totalFiles }} fichier{{ totalFiles > 1 ? 's' : '' }} au total · Dernière compilation : {{ lastCompiled }}
        </p>
      </div>
      <Button
        variant="secondary"
        :disabled="isCompiling"
        @click="handleCompile"
      >
        <Icon name="lucide:zap" class="w-4 h-4 mr-1.5" />
        {{ isCompiling ? 'Compilation...' : 'Compiler le profil' }}
      </Button>
    </div>
  </div>
</template>
```

- [ ] **Créer la page identity.vue**

Créer `frontend/app/pages/profile/identity.vue` :

```vue
<script setup lang="ts">
definePageMeta({ layout: 'profile' })

const { profile, isLoading, fetch, update } = useProfile()
onMounted(fetch)

async function handleSubmit(data: any) {
  try {
    await update(data)
  } catch {
    // erreur affichée via isLoading/error du composable
  }
}

async function handleCompiled() {
  await fetch()
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Identité</h1>
      <p class="text-muted-foreground text-sm mt-1">Informations de base de ton profil professionnel.</p>
    </div>

    <div v-if="isLoading" class="text-muted-foreground text-sm">Chargement...</div>

    <template v-else>
      <IdentityForm :profile="profile" @submit="handleSubmit" />
      <CompileButton :profile="profile" class="mt-6" @compiled="handleCompiled" />
    </template>
  </div>
</template>
```

- [ ] **Vérifier manuellement**

Aller sur http://localhost:3000/profile/identity (après login). Le formulaire doit s'afficher avec les champs vides, le bouton sauvegarder doit appeler `PUT /api/v1/profile`.

- [ ] **Commit**

```bash
git add frontend/app/components/profile/ frontend/app/pages/profile/identity.vue
git commit -m "feat(frontend): add identity page with form and compile button"
```

---

## Task 12 — Composants génériques liste+aperçu

**Files:**
- Create: `frontend/app/components/content/ContentSplitView.vue`
- Create: `frontend/app/components/content/ContentListItem.vue`
- Create: `frontend/app/components/content/ContentPreview.vue`

- [ ] **Créer ContentListItem.vue**

Créer `frontend/app/components/content/ContentListItem.vue` :

```vue
<script setup lang="ts">
defineProps<{
  title: string
  meta: string
  tags: string[]
  hasAiSummary: boolean
  isActive: boolean
}>()
</script>

<template>
  <div
    class="px-3 py-2.5 cursor-pointer border-l-2 transition-colors"
    :class="isActive
      ? 'border-l-primary bg-accent text-accent-foreground'
      : 'border-l-transparent hover:bg-accent/50'"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium truncate">{{ title }}</p>
        <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ meta }}</p>
        <div v-if="tags.length" class="flex flex-wrap gap-1 mt-1.5">
          <span
            v-for="tag in tags.slice(0, 3)"
            :key="tag"
            class="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
          >{{ tag }}</span>
        </div>
      </div>
      <div
        class="w-2 h-2 rounded-full mt-1.5 shrink-0"
        :class="hasAiSummary ? 'bg-green-500' : 'bg-red-400'"
        :title="hasAiSummary ? 'Résumé IA généré' : 'Pas de résumé IA'"
      />
    </div>
  </div>
</template>
```

- [ ] **Créer ContentPreview.vue**

Créer `frontend/app/components/content/ContentPreview.vue` :

```vue
<script setup lang="ts">
defineProps<{
  title: string
  metaItems: { icon: string; label: string }[]
  tags: string[]
  aiSummary?: string
  highlights?: string[]
  body?: string
  slug: string
  editPath: string
}>()

const emit = defineEmits<{ delete: [slug: string] }>()
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
      <h2 class="font-semibold text-sm truncate">{{ title }}</h2>
      <div class="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" as-child>
          <NuxtLink :to="editPath">
            <Icon name="lucide:pencil" class="w-3.5 h-3.5 mr-1" />
            Modifier
          </NuxtLink>
        </Button>
        <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive" @click="emit('delete', slug)">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto px-4 py-4 space-y-4">
      <!-- Meta -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in metaItems"
          :key="item.label"
          class="flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1"
        >
          <Icon :name="item.icon" class="w-3 h-3" />
          {{ item.label }}
        </span>
      </div>

      <!-- Tags -->
      <div v-if="tags.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in tags"
          :key="tag"
          class="text-xs bg-primary/10 text-primary rounded px-2 py-0.5"
        >{{ tag }}</span>
      </div>

      <!-- Résumé IA -->
      <div v-if="aiSummary" class="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
        <p class="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1">
          <Icon name="lucide:zap" class="w-3 h-3" />
          Résumé IA
        </p>
        <p class="text-sm text-muted-foreground">{{ aiSummary }}</p>
      </div>

      <!-- Highlights -->
      <div v-if="highlights?.length">
        <p class="text-xs font-medium text-muted-foreground mb-1.5">Réalisations clés</p>
        <ul class="space-y-1">
          <li v-for="h in highlights" :key="h" class="text-sm flex items-start gap-2">
            <Icon name="lucide:check" class="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
            {{ h }}
          </li>
        </ul>
      </div>

      <!-- Body Markdown -->
      <div v-if="body" class="prose prose-sm dark:prose-invert max-w-none">
        <ContentRenderer :value="{ body }" />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Créer ContentSplitView.vue**

Créer `frontend/app/components/content/ContentSplitView.vue` :

```vue
<script setup lang="ts">
defineProps<{
  title: string
  items: any[]
  selectedSlug: string | null
  createPath: string
}>()

const emit = defineEmits<{
  select: [slug: string]
  delete: [slug: string]
}>()

const slots = defineSlots<{
  'list-item': (props: { item: any; isActive: boolean }) => any
  'preview': (props: { item: any }) => any
  'empty': () => any
}>()
</script>

<template>
  <div class="flex h-[calc(100vh-0px)]">
    <!-- List panel -->
    <div class="w-56 shrink-0 border-r border-border flex flex-col">
      <div class="flex items-center justify-between px-3 py-3 border-b border-border">
        <h2 class="font-semibold text-sm">{{ title }}</h2>
        <Button size="sm" variant="ghost" as-child class="h-7 px-2">
          <NuxtLink :to="createPath">
            <Icon name="lucide:plus" class="w-4 h-4" />
          </NuxtLink>
        </Button>
      </div>

      <div class="flex-1 overflow-auto divide-y divide-border">
        <div
          v-for="item in items"
          :key="item.slug"
          @click="emit('select', item.slug)"
        >
          <slot name="list-item" :item="item" :is-active="item.slug === selectedSlug" />
        </div>

        <div v-if="!items?.length" class="px-3 py-6 text-center text-xs text-muted-foreground">
          Aucun fichier encore.<br />
          <NuxtLink :to="createPath" class="text-primary underline mt-1 inline-block">Créer le premier</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Preview panel -->
    <div class="flex-1 overflow-hidden">
      <template v-if="selectedSlug && items?.find(i => i.slug === selectedSlug)">
        <slot name="preview" :item="items.find(i => i.slug === selectedSlug)" />
      </template>
      <div v-else class="flex items-center justify-center h-full text-muted-foreground text-sm">
        <slot name="empty">
          Sélectionne un élément dans la liste.
        </slot>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Commit**

```bash
git add frontend/app/components/content/ContentSplitView.vue frontend/app/components/content/ContentListItem.vue frontend/app/components/content/ContentPreview.vue
git commit -m "feat(frontend): add generic ContentSplitView, ContentListItem, ContentPreview components"
```

---

## Task 13 — Pages Expériences + ExperienceForm

**Files:**
- Create: `frontend/app/components/content/ExperienceForm.vue`
- Create: `frontend/app/pages/profile/experiences/index.vue`
- Create: `frontend/app/pages/profile/experiences/new.vue`
- Create: `frontend/app/pages/profile/experiences/edit/[slug].vue`

- [ ] **Créer ExperienceForm.vue**

Créer `frontend/app/components/content/ExperienceForm.vue` :

```vue
<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

const props = defineProps<{ initial?: Experience | null }>()
const emit = defineEmits<{ submit: [data: ExperiencePayload]; cancel: [] }>()

const form = reactive<ExperiencePayload>({
  title: props.initial?.title ?? '',
  client: props.initial?.client ?? '',
  role: props.initial?.role ?? '',
  type: props.initial?.type ?? 'mission',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  location: props.initial?.location ?? '',
  stack: props.initial?.stack ?? [],
  tags: props.initial?.tags ?? [],
  highlights: props.initial?.highlights ?? [],
  body: props.initial?.body ?? '',
})

// Tags/stack gérés comme strings séparées par virgule
const stackInput = ref((props.initial?.stack ?? []).join(', '))
const tagsInput = ref((props.initial?.tags ?? []).join(', '))
const highlightsInput = ref((props.initial?.highlights ?? []).join('\n'))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  form.highlights = highlightsInput.value.split('\n').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Titre de la mission *</Label>
        <Input id="title" v-model="form.title" placeholder="Développeur Full-Stack" required />
      </div>
      <div class="space-y-1.5">
        <Label for="client">Client *</Label>
        <Input id="client" v-model="form.client" placeholder="Acme Corp" required />
      </div>
      <div class="space-y-1.5">
        <Label for="role">Rôle *</Label>
        <Input id="role" v-model="form.role" placeholder="Senior Developer" required />
      </div>
      <div class="space-y-1.5">
        <Label for="type">Type</Label>
        <select id="type" v-model="form.type" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="mission">Mission</option>
          <option value="emploi">Emploi</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début *</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-01" required />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2024-06" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Paris (hybride)" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="stack">Stack (séparés par virgule)</Label>
      <Input id="stack" v-model="stackInput" placeholder="TypeScript, Nuxt 3, AdonisJS" />
    </div>

    <div class="space-y-1.5">
      <Label for="tags">Tags (séparés par virgule)</Label>
      <Input id="tags" v-model="tagsInput" placeholder="fullstack, api-rest, agile" />
    </div>

    <div class="space-y-1.5">
      <Label for="highlights">Réalisations clés (une par ligne)</Label>
      <textarea
        id="highlights"
        v-model="highlightsInput"
        rows="4"
        placeholder="Refonte complète de l'UI en Nuxt 3&#10;API REST avec auth session&#10;–40% temps de chargement"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Description détaillée de la mission, contexte métier..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
```

- [ ] **Créer la page liste expériences**

Créer `frontend/app/pages/profile/experiences/index.vue` :

```vue
<script setup lang="ts">
import type { Experience } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: experiences, refresh } = useContent<Experience>('experiences')
const { remove } = useContentFile('experiences')
const selectedSlug = ref<string | null>(null)

const selectedItem = computed(() =>
  experiences.value?.find(e => e.slug === selectedSlug.value) ?? null
)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette expérience ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Expériences"
    :items="experiences ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/experiences/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.client} · ${item.startDate}`"
        :tags="item.stack ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="`${item.title} — ${item.client}`"
        :meta-items="[
          { icon: 'lucide:calendar', label: `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ' – en cours'}` },
          ...(item.location ? [{ icon: 'lucide:map-pin', label: item.location }] : []),
          { icon: 'lucide:user', label: item.role },
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :highlights="item.highlights"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/experiences/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
```

- [ ] **Créer la page de création**

Créer `frontend/app/pages/profile/experiences/new.vue` :

```vue
<script setup lang="ts">
import type { ExperiencePayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, isLoading, error } = useContentFile('experiences')

async function handleSubmit(data: ExperiencePayload) {
  const { slug } = await create(data)
  await navigateTo(`/profile/experiences`)
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/experiences" class="hover:text-foreground">Expériences</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle expérience</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Nouvelle expérience</h1>

    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>

    <ExperienceForm @submit="handleSubmit" @cancel="navigateTo('/profile/experiences')" />
  </div>
</template>
```

- [ ] **Créer la page d'édition**

Créer `frontend/app/pages/profile/experiences/edit/[slug].vue` :

```vue
<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: experience } = await useAsyncData<Experience>(
  `experience-${slug}`,
  () => queryCollection('experiences').where('slug', '=', slug).first() as Promise<Experience>
)

if (!experience.value) {
  await navigateTo('/profile/experiences')
}

const { update, isLoading, error } = useContentFile('experiences')

async function handleSubmit(data: ExperiencePayload) {
  await update(slug, data)
  await navigateTo('/profile/experiences')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/experiences" class="hover:text-foreground">Expériences</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ experience?.title }}</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Modifier l'expérience</h1>

    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>

    <ExperienceForm
      :initial="experience"
      @submit="handleSubmit"
      @cancel="navigateTo('/profile/experiences')"
    />
  </div>
</template>
```

- [ ] **Vérifier manuellement**

1. Aller sur http://localhost:3000/profile/experiences
2. L'expérience d'exemple créée en Task 1 doit apparaître dans la liste
3. Cliquer dessus → aperçu s'affiche à droite
4. Cliquer "+ Nouveau" → formulaire de création
5. Remplir et sauvegarder → retour à la liste, le fichier MD doit être créé dans `frontend/content/experiences/`
6. Cliquer "Modifier" → formulaire pré-rempli

- [ ] **Commit**

```bash
git add frontend/app/components/content/ExperienceForm.vue frontend/app/pages/profile/experiences/
git commit -m "feat(frontend): add experiences pages and ExperienceForm"
```

---

## Task 14 — Pages Compétences + SkillForm

**Files:**
- Create: `frontend/app/components/content/SkillForm.vue`
- Create: `frontend/app/pages/profile/skills/index.vue`
- Create: `frontend/app/pages/profile/skills/new.vue`
- Create: `frontend/app/pages/profile/skills/edit/[slug].vue`

- [ ] **Créer SkillForm.vue**

Créer `frontend/app/components/content/SkillForm.vue` :

```vue
<script setup lang="ts">
import type { Skill, SkillPayload } from '~/types/content'

const props = defineProps<{ initial?: Skill | null }>()
const emit = defineEmits<{ submit: [data: SkillPayload]; cancel: [] }>()

const form = reactive<SkillPayload>({
  title: props.initial?.title ?? '',
  category: props.initial?.category ?? '',
  level: props.initial?.level ?? 'intermédiaire',
  tags: props.initial?.tags ?? [],
  yearsOfExperience: props.initial?.yearsOfExperience ?? undefined,
  lastUsed: props.initial?.lastUsed ?? '',
  contexts: props.initial?.contexts ?? '',
  body: props.initial?.body ?? '',
})

const tagsInput = ref((props.initial?.tags ?? []).join(', '))

function handleSubmit() {
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Compétence *</Label>
        <Input id="title" v-model="form.title" placeholder="TypeScript" required />
      </div>
      <div class="space-y-1.5">
        <Label for="category">Catégorie *</Label>
        <select id="category" v-model="form.category" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
          <option value="">— Choisir —</option>
          <option>Langage</option>
          <option>Framework</option>
          <option>Outil</option>
          <option>Cloud</option>
          <option>Méthode</option>
          <option>Base de données</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="level">Niveau *</Label>
        <select id="level" v-model="form.level" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="débutant">Débutant</option>
          <option value="intermédiaire">Intermédiaire</option>
          <option value="avancé">Avancé</option>
          <option value="expert">Expert</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="yearsOfExperience">Années d'expérience</Label>
        <Input id="yearsOfExperience" v-model.number="form.yearsOfExperience" type="number" min="0" max="30" placeholder="3" />
      </div>
      <div class="space-y-1.5">
        <Label for="lastUsed">Dernière utilisation</Label>
        <Input id="lastUsed" v-model="form.lastUsed" placeholder="2024-06" />
      </div>
      <div class="space-y-1.5">
        <Label for="tags">Tags (séparés par virgule)</Label>
        <Input id="tags" v-model="tagsInput" placeholder="frontend, backend, typage" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="contexts">Contextes d'utilisation</Label>
      <textarea
        id="contexts"
        v-model="form.contexts"
        rows="3"
        placeholder="Développement full-stack, typage strict, generics..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Notes (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="3"
        placeholder="Notes complémentaires..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
```

- [ ] **Créer la page liste compétences**

Créer `frontend/app/pages/profile/skills/index.vue` :

```vue
<script setup lang="ts">
import type { Skill } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: skills, refresh } = useContent<Skill>('skills')
const { remove } = useContentFile('skills')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette compétence ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Compétences"
    :items="skills ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/skills/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.category} · ${item.level}`"
        :tags="item.tags ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:folder', label: item.category },
          { icon: 'lucide:bar-chart', label: item.level },
          ...(item.yearsOfExperience ? [{ icon: 'lucide:clock', label: `${item.yearsOfExperience} ans` }] : []),
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :body="item.contexts"
        :slug="item.slug"
        :edit-path="`/profile/skills/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
```

- [ ] **Créer les pages new et edit**

Créer `frontend/app/pages/profile/skills/new.vue` :

```vue
<script setup lang="ts">
import type { SkillPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('skills')

async function handleSubmit(data: SkillPayload) {
  await create(data)
  await navigateTo('/profile/skills')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/skills" class="hover:text-foreground">Compétences</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle compétence</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouvelle compétence</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <SkillForm @submit="handleSubmit" @cancel="navigateTo('/profile/skills')" />
  </div>
</template>
```

Créer `frontend/app/pages/profile/skills/edit/[slug].vue` :

```vue
<script setup lang="ts">
import type { Skill, SkillPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: skill } = await useAsyncData<Skill>(
  `skill-${slug}`,
  () => queryCollection('skills').where('slug', '=', slug).first() as Promise<Skill>
)

if (!skill.value) await navigateTo('/profile/skills')

const { update, error } = useContentFile('skills')

async function handleSubmit(data: SkillPayload) {
  await update(slug, data)
  await navigateTo('/profile/skills')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/skills" class="hover:text-foreground">Compétences</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ skill?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier la compétence</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <SkillForm :initial="skill" @submit="handleSubmit" @cancel="navigateTo('/profile/skills')" />
  </div>
</template>
```

- [ ] **Commit**

```bash
git add frontend/app/components/content/SkillForm.vue frontend/app/pages/profile/skills/
git commit -m "feat(frontend): add skills pages and SkillForm"
```

---

## Task 15 — Pages Projets + ProjectForm

**Files:**
- Create: `frontend/app/components/content/ProjectForm.vue`
- Create: `frontend/app/pages/profile/projects/index.vue`
- Create: `frontend/app/pages/profile/projects/new.vue`
- Create: `frontend/app/pages/profile/projects/edit/[slug].vue`

- [ ] **Créer ProjectForm.vue**

Créer `frontend/app/components/content/ProjectForm.vue` :

```vue
<script setup lang="ts">
import type { Project, ProjectPayload } from '~/types/content'

const props = defineProps<{ initial?: Project | null }>()
const emit = defineEmits<{ submit: [data: ProjectPayload]; cancel: [] }>()

const form = reactive<ProjectPayload>({
  title: props.initial?.title ?? '',
  type: props.initial?.type ?? 'personnel',
  status: props.initial?.status ?? 'en-cours',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  stack: props.initial?.stack ?? [],
  tags: props.initial?.tags ?? [],
  url: props.initial?.url ?? '',
  demo: props.initial?.demo ?? '',
  body: props.initial?.body ?? '',
})

const stackInput = ref((props.initial?.stack ?? []).join(', '))
const tagsInput = ref((props.initial?.tags ?? []).join(', '))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Nom du projet *</Label>
        <Input id="title" v-model="form.title" placeholder="Mon Super Projet" required />
      </div>
      <div class="space-y-1.5">
        <Label for="type">Type</Label>
        <select id="type" v-model="form.type" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="personnel">Personnel</option>
          <option value="professionnel">Professionnel</option>
          <option value="open-source">Open Source</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="status">Statut</Label>
        <select id="status" v-model="form.status" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="en-cours">En cours</option>
          <option value="terminé">Terminé</option>
          <option value="abandonné">Abandonné</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-01" />
      </div>
      <div class="space-y-1.5">
        <Label for="url">URL du projet</Label>
        <Input id="url" v-model="form.url" placeholder="https://github.com/..." />
      </div>
      <div class="space-y-1.5">
        <Label for="demo">URL démo</Label>
        <Input id="demo" v-model="form.demo" placeholder="https://demo.monprojet.dev" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="stack">Stack (séparés par virgule)</Label>
      <Input id="stack" v-model="stackInput" placeholder="Nuxt 4, AdonisJS, PostgreSQL" />
    </div>

    <div class="space-y-1.5">
      <Label for="tags">Tags (séparés par virgule)</Label>
      <Input id="tags" v-model="tagsInput" placeholder="fullstack, ia, portfolio" />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Description du projet, objectifs, apprentissages..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
```

- [ ] **Créer les 3 pages projets**

Créer `frontend/app/pages/profile/projects/index.vue` :

```vue
<script setup lang="ts">
import type { Project } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: projects, refresh } = useContent<Project>('projects')
const { remove } = useContentFile('projects')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce projet ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Projets"
    :items="projects ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/projects/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.type} · ${item.status}`"
        :tags="item.stack ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:tag', label: item.type },
          { icon: 'lucide:activity', label: item.status },
          ...(item.url ? [{ icon: 'lucide:link', label: 'Voir le projet' }] : []),
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/projects/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
```

Créer `frontend/app/pages/profile/projects/new.vue` :

```vue
<script setup lang="ts">
import type { ProjectPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('projects')

async function handleSubmit(data: ProjectPayload) {
  await create(data)
  await navigateTo('/profile/projects')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/projects" class="hover:text-foreground">Projets</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouveau projet</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouveau projet</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <ProjectForm @submit="handleSubmit" @cancel="navigateTo('/profile/projects')" />
  </div>
</template>
```

Créer `frontend/app/pages/profile/projects/edit/[slug].vue` :

```vue
<script setup lang="ts">
import type { Project, ProjectPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: project } = await useAsyncData<Project>(
  `project-${slug}`,
  () => queryCollection('projects').where('slug', '=', slug).first() as Promise<Project>
)

if (!project.value) await navigateTo('/profile/projects')

const { update, error } = useContentFile('projects')

async function handleSubmit(data: ProjectPayload) {
  await update(slug, data)
  await navigateTo('/profile/projects')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/projects" class="hover:text-foreground">Projets</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ project?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier le projet</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <ProjectForm :initial="project" @submit="handleSubmit" @cancel="navigateTo('/profile/projects')" />
  </div>
</template>
```

- [ ] **Commit**

```bash
git add frontend/app/components/content/ProjectForm.vue frontend/app/pages/profile/projects/
git commit -m "feat(frontend): add projects pages and ProjectForm"
```

---

## Task 16 — Pages Certifications + CertificationForm

**Files:**
- Create: `frontend/app/components/content/CertificationForm.vue`
- Create: `frontend/app/pages/profile/certifications/index.vue`
- Create: `frontend/app/pages/profile/certifications/new.vue`
- Create: `frontend/app/pages/profile/certifications/edit/[slug].vue`

- [ ] **Créer CertificationForm.vue**

Créer `frontend/app/components/content/CertificationForm.vue` :

```vue
<script setup lang="ts">
import type { Certification, CertificationPayload } from '~/types/content'

const props = defineProps<{ initial?: Certification | null }>()
const emit = defineEmits<{ submit: [data: CertificationPayload]; cancel: [] }>()

const form = reactive<CertificationPayload>({
  title: props.initial?.title ?? '',
  organism: props.initial?.organism ?? '',
  date: props.initial?.date ?? '',
  expiry: props.initial?.expiry ?? '',
  credentialId: props.initial?.credentialId ?? '',
  url: props.initial?.url ?? '',
  tags: props.initial?.tags ?? [],
  body: props.initial?.body ?? '',
})

const tagsInput = ref((props.initial?.tags ?? []).join(', '))

function handleSubmit() {
  form.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Certification *</Label>
        <Input id="title" v-model="form.title" placeholder="AWS Solutions Architect Associate" required />
      </div>
      <div class="space-y-1.5">
        <Label for="organism">Organisme *</Label>
        <Input id="organism" v-model="form.organism" placeholder="Amazon Web Services" required />
      </div>
      <div class="space-y-1.5">
        <Label for="date">Date d'obtention *</Label>
        <Input id="date" v-model="form.date" placeholder="2023-06" required />
      </div>
      <div class="space-y-1.5">
        <Label for="expiry">Date d'expiration</Label>
        <Input id="expiry" v-model="form.expiry" placeholder="2026-06" />
      </div>
      <div class="space-y-1.5">
        <Label for="credentialId">ID de la certification</Label>
        <Input id="credentialId" v-model="form.credentialId" placeholder="ABC123XYZ" />
      </div>
      <div class="space-y-1.5">
        <Label for="url">URL de vérification</Label>
        <Input id="url" v-model="form.url" placeholder="https://credentials.example.com/..." />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="tags">Tags (séparés par virgule)</Label>
      <Input id="tags" v-model="tagsInput" placeholder="cloud, aws, architecture" />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Notes personnelles (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="3"
        placeholder="Notes sur la préparation, ressources utilisées..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
      />
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('cancel')">Annuler</Button>
      <Button type="submit">Sauvegarder → MD</Button>
    </div>
  </form>
</template>
```

- [ ] **Créer les 3 pages certifications**

Créer `frontend/app/pages/profile/certifications/index.vue` :

```vue
<script setup lang="ts">
import type { Certification } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: certifications, refresh } = useContent<Certification>('certifications')
const { remove } = useContentFile('certifications')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer cette certification ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Certifications"
    :items="certifications ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/certifications/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="`${item.organism} · ${item.date}`"
        :tags="item.tags ?? []"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:building', label: item.organism },
          { icon: 'lucide:calendar', label: item.date },
          ...(item.expiry ? [{ icon: 'lucide:calendar-x', label: `Expire : ${item.expiry}` }] : []),
          ...(item.credentialId ? [{ icon: 'lucide:hash', label: item.credentialId }] : []),
        ]"
        :tags="item.tags ?? []"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/certifications/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
```

Créer `frontend/app/pages/profile/certifications/new.vue` :

```vue
<script setup lang="ts">
import type { CertificationPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('certifications')

async function handleSubmit(data: CertificationPayload) {
  await create(data)
  await navigateTo('/profile/certifications')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/certifications" class="hover:text-foreground">Certifications</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouvelle certification</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouvelle certification</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <CertificationForm @submit="handleSubmit" @cancel="navigateTo('/profile/certifications')" />
  </div>
</template>
```

Créer `frontend/app/pages/profile/certifications/edit/[slug].vue` :

```vue
<script setup lang="ts">
import type { Certification, CertificationPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: certification } = await useAsyncData<Certification>(
  `certification-${slug}`,
  () => queryCollection('certifications').where('slug', '=', slug).first() as Promise<Certification>
)

if (!certification.value) await navigateTo('/profile/certifications')

const { update, error } = useContentFile('certifications')

async function handleSubmit(data: CertificationPayload) {
  await update(slug, data)
  await navigateTo('/profile/certifications')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile/identity" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/certifications" class="hover:text-foreground">Certifications</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ certification?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier la certification</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <CertificationForm :initial="certification" @submit="handleSubmit" @cancel="navigateTo('/profile/certifications')" />
  </div>
</template>
```

- [ ] **Lancer les tests backend une dernière fois**

```bash
cd backend && node ace test
```

Expected: tous les tests passent.

- [ ] **Commit final**

```bash
git add frontend/app/components/content/CertificationForm.vue frontend/app/pages/profile/certifications/
git commit -m "feat(frontend): add certifications pages and CertificationForm"
```

---

## Checklist de vérification manuelle finale

Après tous les commits, vérifier les scénarios suivants dans le navigateur :

- [ ] `/profile` redirige vers `/profile/identity`
- [ ] La sidebar affiche les 5 sections avec les bons badges compteurs
- [ ] Formulaire identité : remplir et sauvegarder met à jour la DB
- [ ] Bouton "Compiler" retourne un message (stub Phase 1)
- [ ] `/profile/experiences` : fichier d'exemple visible dans la liste
- [ ] Clic sur l'expérience : aperçu s'affiche avec le résumé IA vide et les highlights
- [ ] "+ Nouveau" sur experiences → formulaire → sauvegarde → fichier MD créé dans `frontend/content/experiences/`
- [ ] "Modifier" → formulaire pré-rempli → sauvegarde → fichier MD modifié
- [ ] Supprimer → confirmation → fichier MD supprimé, disparaît de la liste
- [ ] Même scénario fonctionne pour Skills, Projects, Certifications
- [ ] Navigation sidebar : highlight de section active correct
- [ ] Accès sans auth redirige vers `/login`
