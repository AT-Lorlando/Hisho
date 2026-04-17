# Refonte modèle de données — Expériences, Missions, Compétences

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructurer le modèle de données : `experiences` devient employeur, `missions` remplace `projects` (pro + perso), `competency_ratings` stocke les niveaux 1-5 par compétence/domaine.

**Architecture:** Les fichiers Markdown `experiences/` et `missions/` sont gérés par le ContentService générique existant. La table `competency_ratings` est une nouvelle entité Lucid avec son propre controller. Tout le reste (auth, profile, skills, domains, certifications) est inchangé.

**Tech Stack:** AdonisJS 6, Lucid ORM, VineJS, Japa tests, Nuxt Content v3, TypeScript strict

---

## Fichiers concernés

**Créer :**
- `backend/database/migrations/<ts>_create_competency_ratings_table.ts`
- `backend/app/models/competency_rating.ts`
- `backend/app/validators/competency.ts`
- `backend/app/controllers/competency_controller.ts`
- `backend/tests/functional/competency.spec.ts`
- `frontend/content/missions/.gitkeep`

**Modifier :**
- `backend/app/services/content_service.ts` — VALID_CONTENT_TYPES
- `backend/tests/functional/content.spec.ts` — mettre à jour les tests experiences, ajouter missions
- `backend/start/routes.ts` — ajouter routes competency
- `frontend/content.config.ts` — add missions, update experiences, remove projects
- `frontend/app/types/content.ts` — update types

---

## Task 1 — Frontend : types + content.config.ts

**Files:**
- Modify: `frontend/app/types/content.ts`
- Modify: `frontend/content.config.ts`
- Create: `frontend/content/missions/.gitkeep`

Pas de tests frontend à ce stade (les types sont vérifiés à la compilation).

- [ ] **Step 1: Mettre à jour `frontend/app/types/content.ts`**

Remplacer le contenu entier du fichier par :

```typescript
export interface Domain {
  _path: string
  slug: string
  title: string
  description?: string
  order?: number
  aiSummary?: string
  body?: string
}

export interface Experience {
  _path: string
  slug: string
  title: string
  role?: string
  client?: string
  type?: 'cdi' | 'cdd' | 'freelance' | 'alternance' | 'stage'
  startDate?: string
  endDate?: string
  location?: string
  missions: string[]
  aiSummary?: string
  body?: string
}

export interface Mission {
  _path: string
  slug: string
  title: string
  type: 'pro' | 'perso'
  experience?: string
  client?: string
  domains: string[]
  skills: string[]
  startDate?: string
  endDate?: string
  aiSummary?: string
  body?: string
}

export interface Skill {
  _path: string
  slug: string
  title: string
  domain: string
  yearsOfExperience?: number
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

export interface CompetencyRatings {
  skills: Record<string, number>
  domains: Record<string, number>
}

export type ContentType = 'experiences' | 'skills' | 'missions' | 'certifications' | 'domains'

export interface ContentCounts {
  experiences: number
  skills: number
  missions: number
  certifications: number
  domains: number
}

export interface DomainPayload {
  title: string
  description?: string
  order?: number
  body?: string
}

export interface ExperiencePayload {
  title: string
  role?: string
  client?: string
  type?: 'cdi' | 'cdd' | 'freelance' | 'alternance' | 'stage'
  startDate?: string
  endDate?: string
  location?: string
  missions?: string[]
  body?: string
}

export interface MissionPayload {
  title: string
  type: 'pro' | 'perso'
  experience?: string
  client?: string
  domains?: string[]
  skills?: string[]
  startDate?: string
  endDate?: string
  body?: string
}

export interface SkillPayload {
  title: string
  domain: string
  yearsOfExperience?: number
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

- [ ] **Step 2: Mettre à jour `frontend/content.config.ts`**

Remplacer le contenu entier par :

```typescript
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    domains: defineCollection({
      type: 'page',
      source: 'domains/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        order: z.number().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    experiences: defineCollection({
      type: 'page',
      source: 'experiences/*.md',
      schema: z.object({
        title: z.string(),
        role: z.string().optional(),
        client: z.string().optional(),
        type: z.enum(['cdi', 'cdd', 'freelance', 'alternance', 'stage']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        missions: z.array(z.string()).default([]),
        aiSummary: z.string().optional(),
      }),
    }),
    missions: defineCollection({
      type: 'page',
      source: 'missions/*.md',
      schema: z.object({
        title: z.string(),
        type: z.enum(['pro', 'perso']),
        experience: z.string().optional(),
        client: z.string().optional(),
        domains: z.array(z.string()).default([]),
        skills: z.array(z.string()).default([]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        aiSummary: z.string().optional(),
      }),
    }),
    skills: defineCollection({
      type: 'page',
      source: 'skills/*.md',
      schema: z.object({
        title: z.string(),
        domain: z.string(),
        yearsOfExperience: z.number().optional(),
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

- [ ] **Step 3: Créer le dossier missions**

```bash
touch frontend/content/missions/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/types/content.ts frontend/content.config.ts frontend/content/missions/.gitkeep
git commit -m "feat: update frontend types and content config (missions replaces projects)"
```

---

## Task 2 — Backend : ContentService + tests content

**Files:**
- Modify: `backend/app/services/content_service.ts`
- Modify: `backend/tests/functional/content.spec.ts`

- [ ] **Step 1: Mettre à jour `VALID_CONTENT_TYPES` dans `backend/app/services/content_service.ts`**

Changer la ligne :
```typescript
export const VALID_CONTENT_TYPES = ['experiences', 'skills', 'projects', 'certifications', 'domains'] as const
```

Par :
```typescript
export const VALID_CONTENT_TYPES = ['experiences', 'skills', 'missions', 'certifications', 'domains'] as const
```

- [ ] **Step 2: Écrire les tests mis à jour dans `backend/tests/functional/content.spec.ts`**

Remplacer le contenu entier du fichier par :

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

  test('POST /content/experiences creates an employer file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/experiences')
      .loginAs(user)
      .json({
        title: 'Neverhack',
        role: 'Ingénieur DevSecOps',
        client: 'Airbus Defence and Space',
        type: 'cdi',
        startDate: '2023-01',
        location: 'Toulouse',
        missions: ['deploiement-siem-elk'],
        body: 'Mission longue durée.',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'neverhack' })
  })

  test('POST /content/missions creates a pro mission file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/missions')
      .loginAs(user)
      .json({
        title: 'Déploiement SIEM ELK',
        type: 'pro',
        experience: 'neverhack',
        client: 'Airbus Defence and Space',
        domains: ['Cybersécurité', 'Infrastructure'],
        skills: ['ELK Stack', 'Docker'],
        startDate: '2023-06',
        body: '25M logs/jour.',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'deploiement-siem-elk' })
  })

  test('POST /content/missions creates a perso mission file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/missions')
      .loginAs(user)
      .json({
        title: 'Homelab Infrastructure',
        type: 'perso',
        domains: ['Infrastructure'],
        skills: ['Docker', 'Ansible'],
        body: 'Infra perso.',
      })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'homelab-infrastructure' })
  })

  test('POST /content/:type returns 400 for invalid type', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/invalid-type')
      .loginAs(user)
      .json({ title: 'Test' })
    response.assertStatus(400)
  })

  test('POST /content/domains creates a domain file', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .post('/content/domains')
      .loginAs(user)
      .json({ title: 'Cybersécurité', description: 'SOC, pentest, SIEM', body: 'Domaine principal.' })
    response.assertStatus(201)
    response.assertBodyContains({ slug: 'cybersecurite' })
  })

  test('PUT /content/:type/:slug updates existing file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/missions')
      .loginAs(user)
      .json({ title: 'Mission Test', type: 'perso', body: 'v1' })
    const response = await client
      .put('/content/missions/mission-test')
      .loginAs(user)
      .json({ title: 'Mission Test', type: 'perso', body: 'v2 updated' })
    response.assertStatus(200)
  })

  test('DELETE /content/:type/:slug removes file', async ({ client }) => {
    const user = await createUser()
    await client
      .post('/content/missions')
      .loginAs(user)
      .json({ title: 'Mission Delete', type: 'perso', body: '' })
    const response = await client
      .delete('/content/missions/mission-delete')
      .loginAs(user)
    response.assertStatus(204)
  })

  test('DELETE /content/:type/:slug returns 404 for unknown slug', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .delete('/content/missions/nonexistent-slug')
      .loginAs(user)
    response.assertStatus(404)
  })
})
```

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils passent**

```bash
cd backend && node ace test -- --files=tests/functional/content.spec.ts
```

Expected : 9 tests passent.

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/content_service.ts backend/tests/functional/content.spec.ts
git commit -m "feat: add missions to VALID_CONTENT_TYPES, remove projects, update content tests"
```

---

## Task 3 — Backend : migration + modèle CompetencyRating

**Files:**
- Create: `backend/database/migrations/<ts>_create_competency_ratings_table.ts`
- Create: `backend/app/models/competency_rating.ts`

- [ ] **Step 1: Écrire le test de migration dans `backend/tests/functional/competency.spec.ts`**

```typescript
import { test } from '@japa/runner'
import User from '#models/user'
import CompetencyRating from '#models/competency_rating'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('CompetencyController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createUser() {
    return User.create({ email: `u${Date.now()}@test.com`, password: 'password123' })
  }

  test('GET /competencies returns 401 when unauthenticated', async ({ client }) => {
    const response = await client.get('/competencies')
    response.assertStatus(401)
  })

  test('GET /competencies returns empty ratings for new user', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/competencies').loginAs(user)
    response.assertStatus(200)
    response.assertBody({ skills: {}, domains: {} })
  })

  test('PUT /competencies/skill/elk-stack upserts a skill rating', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/skill/elk-stack')
      .loginAs(user)
      .json({ level: 4 })
    response.assertStatus(200)
    response.assertBodyContains({ type: 'skill', slug: 'elk-stack', level: 4 })
  })

  test('PUT /competencies/skill/elk-stack updates existing rating', async ({ client }) => {
    const user = await createUser()
    await client.put('/competencies/skill/elk-stack').loginAs(user).json({ level: 3 })
    const response = await client
      .put('/competencies/skill/elk-stack')
      .loginAs(user)
      .json({ level: 5 })
    response.assertStatus(200)
    response.assertBodyContains({ level: 5 })
    const count = await CompetencyRating.query()
      .where('user_id', user.id)
      .where('slug', 'elk-stack')
      .count('* as total')
    // @ts-ignore
    assert.equal(Number(count[0].$extras.total), 1)
  })

  test('PUT /competencies/:type/:slug returns 422 for level out of range', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/skill/nuxt')
      .loginAs(user)
      .json({ level: 6 })
    response.assertStatus(422)
  })

  test('PUT /competencies/:type/:slug returns 422 for level 0', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/skill/nuxt')
      .loginAs(user)
      .json({ level: 0 })
    response.assertStatus(422)
  })

  test('PUT /competencies/:type/:slug returns 400 for invalid type', async ({ client }) => {
    const user = await createUser()
    const response = await client
      .put('/competencies/invalid/nuxt')
      .loginAs(user)
      .json({ level: 3 })
    response.assertStatus(400)
  })

  test('DELETE /competencies/domain/cybersecurite removes a rating', async ({ client }) => {
    const user = await createUser()
    await client.put('/competencies/domain/cybersecurite').loginAs(user).json({ level: 4 })
    const response = await client.delete('/competencies/domain/cybersecurite').loginAs(user)
    response.assertStatus(204)
  })

  test('DELETE /competencies/:type/:slug returns 404 for unknown rating', async ({ client }) => {
    const user = await createUser()
    const response = await client.delete('/competencies/skill/nonexistent').loginAs(user)
    response.assertStatus(404)
  })

  test('GET /competencies returns ratings after upserts', async ({ client }) => {
    const user = await createUser()
    await client.put('/competencies/skill/elk-stack').loginAs(user).json({ level: 4 })
    await client.put('/competencies/domain/cybersecurite').loginAs(user).json({ level: 3 })
    const response = await client.get('/competencies').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ skills: { 'elk-stack': 4 }, domains: { cybersecurite: 3 } })
  })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
cd backend && node ace test -- --files=tests/functional/competency.spec.ts
```

Expected : FAIL — route `/competencies` introuvable ou modèle inexistant.

- [ ] **Step 3: Créer la migration**

```bash
cd backend && node ace make:migration create_competency_ratings_table
```

Éditer le fichier généré dans `backend/database/migrations/` (le nom commence par le timestamp généré) :

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'competency_ratings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 20).notNullable()
      table.string('slug', 255).notNullable()
      table.integer('level').notNullable()
      table.unique(['user_id', 'type', 'slug'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- [ ] **Step 4: Lancer la migration**

```bash
cd backend && node ace migration:run
```

Expected : `Migrated: database/migrations/<ts>_create_competency_ratings_table`

- [ ] **Step 5: Créer le modèle `backend/app/models/competency_rating.ts`**

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class CompetencyRating extends BaseModel {
  static table = 'competency_ratings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: 'skill' | 'domain'

  @column()
  declare slug: string

  @column()
  declare level: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
```

- [ ] **Step 6: Commit**

```bash
git add backend/database/migrations backend/app/models/competency_rating.ts backend/tests/functional/competency.spec.ts
git commit -m "feat: add competency_ratings migration and CompetencyRating model"
```

---

## Task 4 — Backend : validator + controller + routes

**Files:**
- Create: `backend/app/validators/competency.ts`
- Create: `backend/app/controllers/competency_controller.ts`
- Modify: `backend/start/routes.ts`

- [ ] **Step 1: Créer `backend/app/validators/competency.ts`**

```typescript
import vine from '@vinejs/vine'

export const updateCompetencyValidator = vine.compile(
  vine.object({
    level: vine.number().min(1).max(5),
  })
)
```

- [ ] **Step 2: Créer `backend/app/controllers/competency_controller.ts`**

```typescript
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
      return response.badRequest({ message: `Invalid type: ${params.type}. Must be skill or domain.` })
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
      return response.badRequest({ message: `Invalid type: ${params.type}. Must be skill or domain.` })
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
```

- [ ] **Step 3: Ajouter les routes dans `backend/start/routes.ts`**

Ajouter après les imports existants :

```typescript
const CompetencyController = () => import('#controllers/competency_controller')
```

Ajouter avant la fin du fichier :

```typescript
/**
 * Competency ratings — require auth
 */
router
  .group(() => {
    router.get('/competencies', [CompetencyController, 'index'])
    router.put('/competencies/:type/:slug', [CompetencyController, 'upsert'])
    router.delete('/competencies/:type/:slug', [CompetencyController, 'destroy'])
  })
  .use(middleware.auth())
```

- [ ] **Step 4: Lancer les tests competency**

```bash
cd backend && node ace test -- --files=tests/functional/competency.spec.ts
```

Expected : 10 tests passent.

- [ ] **Step 5: Lancer tous les tests pour vérifier l'absence de régression**

```bash
cd backend && node ace test
```

Expected : tous les tests passent (17 existants + 10 nouveaux = 27 au total, si le test `updateOrCreate` avec `assert` est adapté — voir note ci-dessous).

> **Note sur le test "updates existing rating"** : le test utilise `assert` en variable globale dans Japa. Si l'importation manque, remplacer le bloc `assert.equal(...)` par une vérification via une requête GET :
> ```typescript
> const getResp = await client.get('/competencies').loginAs(user)
> getResp.assertBodyContains({ skills: { 'elk-stack': 5 } })
> ```

- [ ] **Step 6: Commit**

```bash
git add backend/app/validators/competency.ts backend/app/controllers/competency_controller.ts backend/start/routes.ts
git commit -m "feat: add CompetencyController with GET/PUT/DELETE routes and tests"
```

---

## Self-review

**Spec coverage :**
- ✅ `VALID_CONTENT_TYPES` : `missions` ajouté, `projects` retiré
- ✅ `content.config.ts` : collection `missions` ajoutée, `experiences` mise à jour, `projects` retirée
- ✅ Types TS : `Mission`, `MissionPayload`, `Experience` (employeur), `ExperiencePayload`, `CompetencyRatings` ajoutés ; `Project`, `ProjectPayload` retirés
- ✅ Table `competency_ratings` : migration, modèle, unique constraint
- ✅ `GET /competencies` : retourne `{ skills: {}, domains: {} }`
- ✅ `PUT /competencies/:type/:slug` : upsert avec validation 1-5
- ✅ `DELETE /competencies/:type/:slug` : 404 si absent, 204 si supprimé
- ✅ Validation `type` dans `['skill', 'domain']` → 400 sinon
- ✅ Tous les routes protégées par `middleware.auth()`
- ✅ Tests content mis à jour (nouveau shape experiences, tests missions pro + perso)
