# Refonte UX & Modèle de compétences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte de la navigation/auth, introduction des Domaines comme entité libre, simplification des formulaires vers une saisie brute/factuelle.

**Architecture:** Nouveaux types TypeScript + schémas Nuxt Content v3 pour `domains`; simplification des types `Skill`, `Experience`, `Project`; pages auth en français avec branding Hisho; sidebar enrichie (header + footer user + section Domaines).

**Tech Stack:** Nuxt 4 (Vue 3, TypeScript strict), AdonisJS 6 (Japa tests), Nuxt Content v3 (Zod schemas), shadcn-vue, `@nuxt/icon`

---

## Contexte codebase

**Worktree :** travailler sur la branche `master` dans `/home/chuya/Projet/Hisho`

**Proxy Nuxt → backend :** routes `/api/v1/**` → backend (le prefix `/api/v1` est strippé, donc les routes backend sont `/content/:type`, `/profile`, etc.)

**Auth :** session-based (cookies), `loginAs()` dans les tests Japa nécessite `SESSION_DRIVER=memory` (déjà dans `backend/.env.test`)

**Import aliases backend :** `#controllers/*`, `#models/*`, `#services/*`, `#validators/*`, `#start/*`

**Composant auto-import :** pas besoin d'importer Button, Input, Label, Card, Icon, NuxtLink dans les SFC Nuxt

**ContentService :** `private get contentDir()` est un getter lazy (lit `process.env.CONTENT_DIR` à chaque appel) — déjà corrigé, n'instancie pas en module-level.

---

## Fichiers modifiés / créés

```
frontend/
  content.config.ts                          ← ajouter domains, simplifier skills/experiences/projects
  app/
    pages/
      index.vue                              ← redirect intelligente
      login.vue                              ← refonte français + branding Hisho
      register.vue                           ← refonte français + branding Hisho
      profile/
        domains/
          index.vue                          ← nouvelle page (split view)
          new.vue                            ← nouvelle page
          edit/[slug].vue                    ← nouvelle page
        skills/
          index.vue                          ← update meta (domain + years)
        experiences/
          index.vue                          ← update meta (supprimer type)
        projects/
          index.vue                          ← update meta (supprimer type/status)
    components/
      content/
        DomainForm.vue                       ← nouveau composant
        SkillForm.vue                        ← refonte (domain + years + body)
        ExperienceForm.vue                   ← retirer champ type + tags
        ProjectForm.vue                      ← retirer type/status/tags/demo
    composables/
      useContentCounts.ts                    ← ajouter domains
    types/
      content.ts                             ← Domain + simplifications
  content/
    domains/.gitkeep                         ← nouveau dossier content

backend/
  app/
    services/
      content_service.ts                     ← ajouter 'domains' à VALID_CONTENT_TYPES
  tests/
    functional/
      content.spec.ts                        ← ajouter test domains
```

---

### Task 1 — Types TypeScript + content.config.ts

**Files:**
- Modify: `frontend/app/types/content.ts`
- Modify: `frontend/content.config.ts`
- Create: `frontend/content/domains/.gitkeep`

- [ ] **Step 1: Remplacer `frontend/app/types/content.ts` en entier**

```typescript
// frontend/app/types/content.ts
export interface Domain {
  _path: string
  slug: string
  title: string
  description?: string
  order?: number
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

export interface Experience {
  _path: string
  slug: string
  title: string
  client: string
  role: string
  startDate: string
  endDate?: string
  location?: string
  stack: string[]
  highlights: string[]
  aiSummary?: string
  body?: string
}

export interface Project {
  _path: string
  slug: string
  title: string
  startDate?: string
  endDate?: string
  stack: string[]
  url?: string
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

export type ContentType = 'experiences' | 'skills' | 'projects' | 'certifications' | 'domains'

export interface ContentCounts {
  experiences: number
  skills: number
  projects: number
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
  client: string
  role: string
  startDate: string
  endDate?: string
  location?: string
  stack: string[]
  highlights: string[]
  body?: string
}

export interface SkillPayload {
  title: string
  domain: string
  yearsOfExperience?: number
  body?: string
}

export interface ProjectPayload {
  title: string
  startDate?: string
  endDate?: string
  stack: string[]
  url?: string
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

- [ ] **Step 2: Remplacer `frontend/content.config.ts` en entier**

```typescript
// frontend/content.config.ts
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
        client: z.string(),
        role: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        stack: z.array(z.string()).default([]),
        highlights: z.array(z.string()).default([]),
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
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        stack: z.array(z.string()).default([]),
        url: z.string().optional(),
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

- [ ] **Step 3: Créer le dossier domains**

```bash
touch frontend/content/domains/.gitkeep
```

- [ ] **Step 4: Vérifier le typecheck frontend**

```bash
cd frontend && npm run typecheck 2>&1 | head -40
```

Attendu : des erreurs TypeScript sur les fichiers qui utilisent encore `category`, `level`, `type`, `status`, `tags` — c'est **normal et attendu**, ces fichiers sont fixés dans les tâches suivantes. La commande ne doit pas faire planter Node.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/types/content.ts frontend/content.config.ts frontend/content/domains/.gitkeep
git commit -m "feat: add Domain type, simplify Skill/Experience/Project types and content.config"
```

---

### Task 2 — Backend : ajouter `domains` à ContentService + test

**Files:**
- Modify: `backend/app/services/content_service.ts`
- Modify: `backend/tests/functional/content.spec.ts`

- [ ] **Step 1: Ajouter `domains` à VALID_CONTENT_TYPES**

Dans `backend/app/services/content_service.ts`, ligne 6, modifier :

```typescript
export const VALID_CONTENT_TYPES = ['experiences', 'skills', 'projects', 'certifications', 'domains'] as const
```

- [ ] **Step 2: Ajouter un test domains dans `backend/tests/functional/content.spec.ts`**

Ajouter ce test dans le groupe existant `ContentController`, après le test `POST /content/:type returns 400 for invalid type` :

```typescript
test('POST /content/domains creates a domain file', async ({ client }) => {
  const user = await createUser()
  const response = await client
    .post('/content/domains')
    .loginAs(user)
    .json({
      title: 'Cybersécurité',
      description: 'SOC, pentest, SIEM',
      body: 'Domaine principal.',
    })

  response.assertStatus(201)
  response.assertBodyContains({ slug: 'cybersecurite' })
})
```

- [ ] **Step 3: Lancer les tests backend**

```bash
cd backend && npm test 2>&1 | tail -30
```

Attendu : `Tests  17 passed (17)`

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/content_service.ts backend/tests/functional/content.spec.ts
git commit -m "feat: add domains to ContentService valid types + test"
```

---

### Task 3 — Pages auth & homepage

**Files:**
- Modify: `frontend/app/pages/index.vue`
- Modify: `frontend/app/pages/login.vue`
- Modify: `frontend/app/pages/register.vue`

- [ ] **Step 1: Remplacer `frontend/app/pages/index.vue`**

```vue
<!-- frontend/app/pages/index.vue -->
<script setup lang="ts">
const { isAuthenticated } = useAuth()
await navigateTo(isAuthenticated.value ? '/profile' : '/login', { replace: true })
</script>
```

- [ ] **Step 2: Remplacer `frontend/app/pages/login.vue`**

```vue
<!-- frontend/app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { login, isLoading } = useAuth()
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await login(email.value, password.value)
    await navigateTo('/profile')
  } catch {}
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Hisho</h1>
      <p class="text-sm text-muted-foreground mt-1">Votre portfolio technique, augmenté par l'IA</p>
    </div>
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required :disabled="isLoading" />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Mot de passe</Label>
            <Input id="password" v-model="password" type="password" placeholder="••••••••" required :disabled="isLoading" />
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Pas encore de compte ?
          <NuxtLink to="/register" class="text-primary hover:underline">S'inscrire</NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
```

- [ ] **Step 3: Remplacer `frontend/app/pages/register.vue`**

```vue
<!-- frontend/app/pages/register.vue -->
<script setup lang="ts">
import { toast } from 'vue-sonner'
definePageMeta({ middleware: 'guest' })

const { register, isLoading } = useAuth()
const email = ref('')
const password = ref('')
const fullName = ref('')

async function handleRegister() {
  if (password.value.length < 8) {
    toast.error('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  try {
    await register(email.value, password.value, fullName.value || undefined)
    await navigateTo('/profile')
  } catch {}
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Hisho</h1>
      <p class="text-sm text-muted-foreground mt-1">Votre portfolio technique, augmenté par l'IA</p>
    </div>
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div class="space-y-1.5">
            <Label for="fullName">Nom complet</Label>
            <Input id="fullName" v-model="fullName" type="text" placeholder="Jean Dupont" :disabled="isLoading" />
          </div>
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required :disabled="isLoading" />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Mot de passe</Label>
            <Input id="password" v-model="password" type="password" placeholder="••••••••" required :disabled="isLoading" />
            <p class="text-xs text-muted-foreground">8 caractères minimum</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Création...' : 'Créer mon compte' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary hover:underline">Se connecter</NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/pages/index.vue frontend/app/pages/login.vue frontend/app/pages/register.vue
git commit -m "feat: refonte pages auth en français + branding Hisho + redirect intelligente"
```

---

### Task 4 — ProfileSidebar + useContentCounts

**Files:**
- Modify: `frontend/app/components/profile/ProfileSidebar.vue`
- Modify: `frontend/app/composables/useContentCounts.ts`

- [ ] **Step 1: Remplacer `frontend/app/composables/useContentCounts.ts`**

```typescript
// frontend/app/composables/useContentCounts.ts
import type { ContentCounts } from '~/types/content'

export function useContentCounts() {
  const { data: counts } = useAsyncData<ContentCounts>(
    'content-counts',
    async () => {
      const [exp, skills, projects, certs, domains] = await Promise.all([
        queryCollection('experiences').count(),
        queryCollection('skills').count(),
        queryCollection('projects').count(),
        queryCollection('certifications').count(),
        queryCollection('domains').count(),
      ])
      return { experiences: exp, skills, projects, certifications: certs, domains }
    },
    { default: () => ({ experiences: 0, skills: 0, projects: 0, certifications: 0, domains: 0 }) }
  )

  return counts
}
```

- [ ] **Step 2: Remplacer `frontend/app/components/profile/ProfileSidebar.vue`**

```vue
<!-- frontend/app/components/profile/ProfileSidebar.vue -->
<script setup lang="ts">
const route = useRoute()
const counts = useContentCounts()
const { user, logout } = useAuth()

const sections = [
  { label: 'Identité', path: '/profile/identity', icon: 'lucide:user', key: null },
  { label: 'Domaines', path: '/profile/domains', icon: 'lucide:layers', key: 'domains' as const },
  { label: 'Compétences', path: '/profile/skills', icon: 'lucide:zap', key: 'skills' as const },
  { label: 'Expériences', path: '/profile/experiences', icon: 'lucide:briefcase', key: 'experiences' as const },
  { label: 'Projets', path: '/profile/projects', icon: 'lucide:rocket', key: 'projects' as const },
  { label: 'Certifications', path: '/profile/certifications', icon: 'lucide:award', key: 'certifications' as const },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="w-52 shrink-0 border-r border-border bg-background flex flex-col">
    <!-- Header -->
    <div class="px-4 py-4 border-b border-border">
      <NuxtLink to="/profile" class="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
        Hisho
      </NuxtLink>
    </div>

    <!-- Nav links -->
    <div class="flex-1 py-3 px-2 flex flex-col gap-1 overflow-auto">
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
    </div>

    <!-- Footer user -->
    <div class="px-3 py-3 border-t border-border">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground truncate">{{ user?.email }}</span>
        <Button variant="ghost" size="sm" class="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground" @click="logout">
          <Icon name="lucide:log-out" class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </nav>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/components/profile/ProfileSidebar.vue frontend/app/composables/useContentCounts.ts
git commit -m "feat: sidebar with Hisho header, Domaines section, user footer + domains count"
```

---

### Task 5 — DomainForm + pages Domaines

**Files:**
- Create: `frontend/app/components/content/DomainForm.vue`
- Create: `frontend/app/pages/profile/domains/index.vue`
- Create: `frontend/app/pages/profile/domains/new.vue`
- Create: `frontend/app/pages/profile/domains/edit/[slug].vue`

- [ ] **Step 1: Créer `frontend/app/components/content/DomainForm.vue`**

```vue
<!-- frontend/app/components/content/DomainForm.vue -->
<script setup lang="ts">
import type { Domain, DomainPayload } from '~/types/content'

const props = defineProps<{ initial?: Domain | null }>()
const emit = defineEmits<{ submit: [data: DomainPayload]; cancel: [] }>()

const form = reactive<DomainPayload>({
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
  order: props.initial?.order ?? undefined,
  body: props.initial?.body ?? '',
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Nom du domaine *</Label>
        <Input id="title" v-model="form.title" placeholder="Cybersécurité" required />
      </div>
      <div class="space-y-1.5">
        <Label for="order">Ordre d'affichage</Label>
        <Input id="order" v-model.number="form.order" type="number" min="0" placeholder="1" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="description">Description courte</Label>
        <Input id="description" v-model="form.description" placeholder="SOC, pentest, SIEM, CTF, PKI" />
      </div>
    </div>
    <div class="space-y-1.5">
      <Label for="body">Notes (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Positionnement, spécialisation, contexte d'utilisation..."
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

- [ ] **Step 2: Créer `frontend/app/pages/profile/domains/index.vue`**

```vue
<!-- frontend/app/pages/profile/domains/index.vue -->
<script setup lang="ts">
import type { Domain } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { items: domains, refresh } = useContent<Domain>('domains')
const { remove } = useContentFile('domains')
const selectedSlug = ref<string | null>(null)

async function handleDelete(slug: string) {
  if (!confirm('Supprimer ce domaine ?')) return
  await remove(slug)
  if (selectedSlug.value === slug) selectedSlug.value = null
  await refresh()
}
</script>

<template>
  <ContentSplitView
    title="Domaines"
    :items="domains ?? []"
    :selected-slug="selectedSlug"
    create-path="/profile/domains/new"
    @select="selectedSlug = $event"
    @delete="handleDelete"
  >
    <template #list-item="{ item, isActive }">
      <ContentListItem
        :title="item.title"
        :meta="item.description ?? ''"
        :tags="[]"
        :has-ai-summary="false"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          ...(item.description ? [{ icon: 'lucide:info', label: item.description }] : []),
          ...(item.order !== undefined ? [{ icon: 'lucide:list-ordered', label: `Ordre : ${item.order}` }] : []),
        ]"
        :tags="[]"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/domains/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
```

- [ ] **Step 3: Créer `frontend/app/pages/profile/domains/new.vue`**

```vue
<!-- frontend/app/pages/profile/domains/new.vue -->
<script setup lang="ts">
import type { DomainPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const { create, error } = useContentFile('domains')

async function handleSubmit(data: DomainPayload) {
  await create(data)
  await navigateTo('/profile/domains')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/domains" class="hover:text-foreground">Domaines</NuxtLink>
      <span>/</span>
      <span class="text-foreground">Nouveau domaine</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Nouveau domaine</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <DomainForm @submit="handleSubmit" @cancel="navigateTo('/profile/domains')" />
  </div>
</template>
```

- [ ] **Step 4: Créer `frontend/app/pages/profile/domains/edit/[slug].vue`**

```vue
<!-- frontend/app/pages/profile/domains/edit/[slug].vue -->
<script setup lang="ts">
import type { Domain, DomainPayload } from '~/types/content'

definePageMeta({ layout: 'profile' })

const route = useRoute()
const slug = route.params.slug as string

const { data: domain } = await useAsyncData<Domain>(
  `domain-${slug}`,
  () => queryCollection('domains').where('slug', '=', slug).first() as Promise<Domain>
)

if (!domain.value) await navigateTo('/profile/domains')

const { update, error } = useContentFile('domains')

async function handleSubmit(data: DomainPayload) {
  await update(slug, data)
  await navigateTo('/profile/domains')
}
</script>

<template>
  <div class="p-8 max-w-3xl">
    <nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <NuxtLink to="/profile" class="hover:text-foreground">Mon profil</NuxtLink>
      <span>/</span>
      <NuxtLink to="/profile/domains" class="hover:text-foreground">Domaines</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ domain?.title }}</span>
    </nav>
    <h1 class="text-2xl font-bold mb-6">Modifier le domaine</h1>
    <p v-if="error" class="text-sm text-destructive mb-4">{{ error }}</p>
    <DomainForm :initial="domain" @submit="handleSubmit" @cancel="navigateTo('/profile/domains')" />
  </div>
</template>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/components/content/DomainForm.vue frontend/app/pages/profile/domains/
git commit -m "feat: add DomainForm and domains pages (index/new/edit)"
```

---

### Task 6 — SkillForm + skills/index.vue

**Files:**
- Modify: `frontend/app/components/content/SkillForm.vue`
- Modify: `frontend/app/pages/profile/skills/index.vue`

- [ ] **Step 1: Remplacer `frontend/app/components/content/SkillForm.vue`**

```vue
<!-- frontend/app/components/content/SkillForm.vue -->
<script setup lang="ts">
import type { Skill, SkillPayload } from '~/types/content'

const props = defineProps<{ initial?: Skill | null }>()
const emit = defineEmits<{ submit: [data: SkillPayload]; cancel: [] }>()

const { items: domains } = useContent<any>('domains')

const form = reactive<SkillPayload>({
  title: props.initial?.title ?? '',
  domain: props.initial?.domain ?? '',
  yearsOfExperience: props.initial?.yearsOfExperience ?? undefined,
  body: props.initial?.body ?? '',
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="title">Compétence *</Label>
        <Input id="title" v-model="form.title" placeholder="ELK Stack" required />
      </div>
      <div class="space-y-1.5">
        <Label for="domain">Domaine *</Label>
        <input
          id="domain"
          v-model="form.domain"
          list="domain-list"
          required
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Cybersécurité"
        />
        <datalist id="domain-list">
          <option v-for="d in domains" :key="d.slug" :value="d.title" />
        </datalist>
      </div>
      <div class="space-y-1.5">
        <Label for="years">Années d'expérience</Label>
        <Input id="years" v-model.number="form.yearsOfExperience" type="number" min="0" max="30" placeholder="3" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="body">Contexte d'utilisation (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="7"
        placeholder="Décris comment tu utilises cette techno : projets, contexte, ce qui te distingue, niveau implicite...&#10;&#10;Exemple : 3 déploiements ELK sur systèmes sensibles (prod). Ingestion multi-sources (syslog, beats, API), dashboards Kibana custom, alerting Watcher. Utilisé en contexte SOC pour la détection d'anomalies."
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

- [ ] **Step 2: Mettre à jour `frontend/app/pages/profile/skills/index.vue`**

Remplacer le fichier entier :

```vue
<!-- frontend/app/pages/profile/skills/index.vue -->
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
        :meta="`${item.domain}${item.yearsOfExperience ? ` · ${item.yearsOfExperience} ans` : ''}`"
        :tags="[]"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          { icon: 'lucide:layers', label: item.domain },
          ...(item.yearsOfExperience ? [{ icon: 'lucide:clock', label: `${item.yearsOfExperience} ans d'expérience` }] : []),
        ]"
        :tags="[]"
        :ai-summary="item.aiSummary"
        :body="item.body"
        :slug="item.slug"
        :edit-path="`/profile/skills/edit/${item.slug}`"
        @delete="handleDelete"
      />
    </template>
  </ContentSplitView>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/components/content/SkillForm.vue frontend/app/pages/profile/skills/index.vue
git commit -m "feat: rewrite SkillForm (domain + years + free body) and update skills list view"
```

---

### Task 7 — ExperienceForm + experiences/index.vue

**Files:**
- Modify: `frontend/app/components/content/ExperienceForm.vue`
- Modify: `frontend/app/pages/profile/experiences/index.vue`

- [ ] **Step 1: Remplacer `frontend/app/components/content/ExperienceForm.vue`**

Supprimer les champs `type` et `tags`. Remplacer le fichier entier :

```vue
<!-- frontend/app/components/content/ExperienceForm.vue -->
<script setup lang="ts">
import type { Experience, ExperiencePayload } from '~/types/content'

const props = defineProps<{ initial?: Experience | null }>()
const emit = defineEmits<{ submit: [data: ExperiencePayload]; cancel: [] }>()

const form = reactive<ExperiencePayload>({
  title: props.initial?.title ?? '',
  client: props.initial?.client ?? '',
  role: props.initial?.role ?? '',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  location: props.initial?.location ?? '',
  stack: props.initial?.stack ?? [],
  highlights: props.initial?.highlights ?? [],
  body: props.initial?.body ?? '',
})

const stackInput = ref((props.initial?.stack ?? []).join(', '))
const highlightsInput = ref((props.initial?.highlights ?? []).join('\n'))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
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
        <Label for="startDate">Début *</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-01" required />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2024-06" />
      </div>
      <div class="space-y-1.5">
        <Label for="location">Localisation</Label>
        <Input id="location" v-model="form.location" placeholder="Paris (hybride)" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="stack">Stack technique (séparés par virgule) *</Label>
      <Input id="stack" v-model="stackInput" placeholder="TypeScript, Nuxt 3, AdonisJS, PostgreSQL" />
    </div>

    <div class="space-y-1.5">
      <Label for="highlights">Réalisations clés (une par ligne)</Label>
      <textarea
        id="highlights"
        v-model="highlightsInput"
        rows="4"
        placeholder="Refonte complète de l'UI en Nuxt 3&#10;API REST avec authentification session&#10;–40% temps de chargement"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="5"
        placeholder="Contexte métier, enjeux techniques, environnement..."
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

- [ ] **Step 2: Mettre à jour `frontend/app/pages/profile/experiences/index.vue`**

Changer uniquement la ligne `:meta` dans `ContentListItem` (supprimer `item.type`) :

```vue
<!-- Remplacer cette ligne dans le template #list-item : -->
:meta="`${item.client} · ${item.startDate}`"
```

Le reste du fichier reste identique.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/components/content/ExperienceForm.vue frontend/app/pages/profile/experiences/index.vue
git commit -m "feat: simplify ExperienceForm (remove type/tags) and update experiences list meta"
```

---

### Task 8 — ProjectForm + projects/index.vue

**Files:**
- Modify: `frontend/app/components/content/ProjectForm.vue`
- Modify: `frontend/app/pages/profile/projects/index.vue`

- [ ] **Step 1: Remplacer `frontend/app/components/content/ProjectForm.vue`**

```vue
<!-- frontend/app/components/content/ProjectForm.vue -->
<script setup lang="ts">
import type { Project, ProjectPayload } from '~/types/content'

const props = defineProps<{ initial?: Project | null }>()
const emit = defineEmits<{ submit: [data: ProjectPayload]; cancel: [] }>()

const form = reactive<ProjectPayload>({
  title: props.initial?.title ?? '',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  stack: props.initial?.stack ?? [],
  url: props.initial?.url ?? '',
  body: props.initial?.body ?? '',
})

const stackInput = ref((props.initial?.stack ?? []).join(', '))

function handleSubmit() {
  form.stack = stackInput.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5 col-span-2">
        <Label for="title">Nom du projet *</Label>
        <Input id="title" v-model="form.title" placeholder="Hisho" required />
      </div>
      <div class="space-y-1.5">
        <Label for="startDate">Début</Label>
        <Input id="startDate" v-model="form.startDate" placeholder="2024-04" />
      </div>
      <div class="space-y-1.5">
        <Label for="endDate">Fin (vide = en cours)</Label>
        <Input id="endDate" v-model="form.endDate" placeholder="2024-12" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="stack">Stack (séparés par virgule)</Label>
        <Input id="stack" v-model="stackInput" placeholder="Nuxt 4, AdonisJS, PostgreSQL, Claude API" />
      </div>
      <div class="space-y-1.5 col-span-2">
        <Label for="url">URL</Label>
        <Input id="url" v-model="form.url" placeholder="https://github.com/..." />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="body">Description (Markdown)</Label>
      <textarea
        id="body"
        v-model="form.body"
        rows="6"
        placeholder="Objectifs, apprentissages, contexte, statut actuel..."
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

- [ ] **Step 2: Mettre à jour `frontend/app/pages/profile/projects/index.vue`**

Changer uniquement dans le template :
- `:meta` du `ContentListItem` : `item.type · item.status` → `` `${item.stack?.slice(0,2).join(', ') ?? ''}` ``
- `:meta-items` du `ContentPreview` : retirer les items `type` et `status`, garder uniquement `url`

```vue
<!-- Nouveau contenu de index.vue entier : -->
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
        :meta="item.stack?.slice(0, 2).join(', ') ?? ''"
        :tags="[]"
        :has-ai-summary="!!item.aiSummary"
        :is-active="isActive"
      />
    </template>

    <template #preview="{ item }">
      <ContentPreview
        :title="item.title"
        :meta-items="[
          ...(item.startDate ? [{ icon: 'lucide:calendar', label: `${item.startDate}${item.endDate ? ` – ${item.endDate}` : ' – en cours'}` }] : []),
          ...(item.url ? [{ icon: 'lucide:link', label: item.url }] : []),
        ]"
        :tags="item.stack ?? []"
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

- [ ] **Step 3: Vérifier le typecheck frontend**

```bash
cd frontend && npm run typecheck 2>&1 | head -40
```

Attendu : 0 erreur TypeScript (tous les fichiers qui utilisaient `category`, `level`, `type`, `status`, `tags` ont été mis à jour).

- [ ] **Step 4: Lancer les tests backend pour s'assurer que rien n'est cassé**

```bash
cd backend && npm test 2>&1 | tail -15
```

Attendu : `Tests  17 passed (17)`

- [ ] **Step 5: Commit**

```bash
git add frontend/app/components/content/ProjectForm.vue frontend/app/pages/profile/projects/index.vue
git commit -m "feat: simplify ProjectForm (remove type/status/tags/demo) and update projects list"
```

---

## Self-Review

**Spec coverage :**
- ✅ `/` redirect intelligente → Task 3
- ✅ Login/register en français avec branding → Task 3
- ✅ Sidebar avec header Hisho + Domaines + footer user → Task 4
- ✅ Domaines : entité libre, DomainForm, pages CRUD → Tasks 1 + 2 + 5
- ✅ Skills : domain (autocomplete) + years + body libre → Tasks 1 + 6
- ✅ Experiences : suppression type/tags → Tasks 1 + 7
- ✅ Projects : suppression type/status/tags/demo → Tasks 1 + 8
- ✅ Certifications : inchangé (pas de tâche, conforme au spec)
- ✅ Backend : domains dans VALID_CONTENT_TYPES + test → Task 2
- ✅ content.config.ts et types/content.ts mis à jour → Task 1

**Hors scope confirmé :** `default.vue` (les pages auth gèrent leur propre mise en page, aucun changement nécessaire), validators backend (le validator existant utilise `allowUnknownProperties()`, compatible avec tous les types).
