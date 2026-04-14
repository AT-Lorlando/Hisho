# CLAUDE.md — Hisho

**Hisho** (秘書, "secrétaire" en japonais) est une application personnelle de gestion de portfolio professionnel augmenté par IA. Elle centralise les expériences, compétences, projets et certifications sous forme de fichiers Markdown, et expose un assistant IA (Claude) pour générer des dossiers techniques, rédiger des mails/posts LinkedIn et construire des CV sur mesure.

---

## Architecture technique

### Vue d'ensemble

```
Hisho/
├── frontend/          # Nuxt 4 (Vue 3) — UI + Nuxt Content v3
├── backend/           # AdonisJS 6 — API métier + proxy LLM
├── content/           # Fichiers Markdown (expériences, compétences, etc.)
└── docker-compose.yml
```

### Frontend (Nuxt 4)

**Framework** : Nuxt 4 avec Vue 3, TypeScript strict

**Modules clés** :
- `@nuxt/content` v3 — parsing et query des fichiers Markdown
- `shadcn-nuxt` — composants UI (style "new-york", sans préfixe)
- `@pinia/nuxt` — state management
- `@nuxt/icon` — icônes Lucide + Unicons
- Tailwind CSS v4 avec espace OKLCH

**Structure** :
```
frontend/app/
├── pages/
│   ├── index.vue               # Dashboard / accueil
│   ├── content/
│   │   ├── index.vue           # Content Browser
│   │   ├── experiences/        # Liste + détail expériences
│   │   ├── skills/             # Liste compétences
│   │   ├── projects/           # Liste projets
│   │   └── certifications/     # Liste certifications
│   ├── cv-builder/
│   │   └── index.vue           # CV Builder drag & drop
│   ├── assistant/
│   │   └── index.vue           # AI Assistant
│   └── phrasers/
│       └── index.vue           # Phraser Manager
├── components/
│   ├── ui/                     # shadcn-vue components
│   ├── content/                # Composants Content Browser
│   ├── cv/                     # Composants CV Builder
│   └── assistant/              # Composants AI Assistant
├── composables/
│   ├── useAuth.ts              # Auth (existant)
│   ├── useContent.ts           # Query Nuxt Content
│   ├── useAI.ts                # Appels IA via backend
│   └── useCVBuilder.ts         # Logique drag & drop CV
├── stores/
│   ├── auth.ts                 # Auth store (existant)
│   └── cvBuilder.ts            # État du CV en construction
└── assets/css/main.css
```

**Appels API** :
- Routes `/api/v1/**` → proxy vers le backend AdonisJS
- Contenu Markdown → `queryCollection()` (Nuxt Content v3, côté serveur/client)
- **Jamais d'appel direct à l'API Anthropic depuis le client**

### Backend (AdonisJS 6)

**Framework** : AdonisJS 6, TypeScript strict

**Rôle** : logique métier, proxy LLM sécurisé, gestion des phrasers en base

**Structure** :
```
backend/app/
├── controllers/
│   ├── auth_controller.ts      # Auth (existant)
│   ├── ai_controller.ts        # Proxy LLM (génération DT, mail, CV)
│   └── phrasers_controller.ts  # CRUD phrasers
├── services/
│   ├── claude_service.ts       # Wrapper SDK Anthropic
│   └── content_service.ts      # Helpers pour construire les contextes IA
├── models/
│   ├── user.ts                 # (existant)
│   └── phraser.ts              # Modèle Phraser en DB
├── validators/
│   ├── auth.ts                 # (existant)
│   └── ai.ts                   # Validation des inputs IA
└── middleware/
```

**Routes API** :
```
POST /api/v1/ai/generate-dt        # Générer un dossier technique
POST /api/v1/ai/compose            # Rédiger mail/LinkedIn/réponse
POST /api/v1/ai/rewrite            # Réécrire un bloc d'expérience
GET  /api/v1/phrasers              # Lister les phrasers
POST /api/v1/phrasers              # Créer un phraser
PUT  /api/v1/phrasers/:id          # Modifier un phraser
DELETE /api/v1/phrasers/:id        # Supprimer un phraser
```

**Variables d'environnement supplémentaires** (backend `.env`) :
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

### Contenu Markdown

Les fichiers Markdown sont dans `content/` à la racine du projet (ou `frontend/content/` selon config Nuxt Content). Nuxt Content v3 les parse et expose une API de query.

**Installation** :
```bash
cd frontend
npm install @nuxt/content
```

**Configuration** (`nuxt.config.ts`) :
```ts
modules: ['@nuxt/content', ...]
content: {
  // collections définies dans content.config.ts
}
```

---

## Structure des contenus Markdown

### `content/experiences/*.md`

```yaml
---
title: "Développeur Full-Stack — Projet X"
client: "Acme Corp"
role: "Développeur Full-Stack Senior"
type: "mission"          # mission | emploi | freelance
startDate: "2024-01"
endDate: "2024-06"       # omis si en cours
duration: "6 mois"
location: "Paris (hybride)"
stack:
  - TypeScript
  - Nuxt 3
  - AdonisJS
  - PostgreSQL
tags:
  - fullstack
  - api-rest
  - frontend
  - agile
highlights:
  - "Refonte complète de l'interface utilisateur en Nuxt 3"
  - "Mise en place d'une API REST AdonisJS avec authentification JWT"
  - "Réduction de 40% du temps de chargement"
---

Description détaillée de la mission, contexte métier, enjeux techniques...
```

### `content/skills/*.md`

```yaml
---
title: "TypeScript"
category: "Langage"        # Langage | Framework | Outil | Cloud | Méthode
level: "expert"            # débutant | intermédiaire | avancé | expert
tags:
  - frontend
  - backend
  - typage
yearsOfExperience: 4
contexts:
  - "Développement full-stack (Nuxt, AdonisJS)"
  - "Typage strict, generics, decorators"
lastUsed: "2024-06"
---

Description du contexte d'utilisation, projets associés...
```

### `content/projects/*.md`

```yaml
---
title: "Hisho"
type: "personnel"          # personnel | professionnel | open-source
status: "en-cours"         # en-cours | terminé | abandonné
startDate: "2024-04"
endDate: null
stack:
  - Nuxt 4
  - AdonisJS 6
  - PostgreSQL
  - Claude API
tags:
  - fullstack
  - ia
  - portfolio
url: "https://github.com/..."
demo: null
---

Description du projet, objectifs, apprentissages...
```

### `content/certifications/*.md`

```yaml
---
title: "AWS Solutions Architect Associate"
organism: "Amazon Web Services"
date: "2023-06"
expiry: "2026-06"          # null si pas d'expiration
credentialId: "ABC123"
url: "https://..."
tags:
  - cloud
  - aws
  - architecture
---

Notes personnelles sur la certification...
```

### `content/phrasers/*.md`

> Les phrasers peuvent être stockés en Markdown (lecture seule) **ou** en base PostgreSQL via le Phraser Manager (CRUD). Les fichiers Markdown servent de phrasers système pré-définis.

```yaml
---
title: "Professionnel concis"
slug: "pro-concis"
description: "Ton professionnel, phrases courtes, vocabulaire technique précis"
useCase:
  - "email"
  - "linkedin"
  - "réponse-recruteur"
language: "fr"
---

## Instructions système

Tu es un rédacteur professionnel expert. Tes réponses sont concises, directes et utilisent un vocabulaire technique précis. Tu évites les formules creuses et les superlatifs. Chaque phrase a un but.

## Exemples

**Entrée** : Reformule cette expérience pour un mail de candidature
**Sortie** : "J'ai conduit la migration d'une architecture monolithique vers des microservices, réduisant les temps de déploiement de 60% et améliorant la résilience du système."
```

---

## Modules fonctionnels

### Content Browser

Navigation et filtrage dans le portfolio.

**Fonctionnalités** :
- Vue liste/grille pour chaque type (expériences, compétences, projets, certifs)
- Filtres par tags, stack, niveau, dates
- Recherche full-text via Nuxt Content
- Affichage du détail avec rendu Markdown

**Composable principal** (`useContent.ts`) :
```ts
// Query typée des collections
const { data: experiences } = await useAsyncData(() =>
  queryCollection('experiences')
    .where('tags', 'CONTAINS', selectedTag.value)
    .order('startDate', 'DESC')
    .all()
)
```

### AI Assistant

Interface pour les cas d'usage IA. Toujours côté serveur via backend.

**Cas d'usage** :

1. **Génération de dossier technique (DT)**
   - Input : structure du DT cible + contexte de la mission
   - L'IA sélectionne les expériences pertinentes et pré-remplit le DT
   - Output : Markdown éditable

2. **Rédaction mail/LinkedIn/réponse**
   - Input : instructions libres + sélection d'un phraser
   - Output : texte prêt à copier, éditable

3. **Réécriture de bloc d'expérience**
   - Input : bloc Markdown + phraser + instructions
   - Output : version réécrite

**Composable** (`useAI.ts`) :
```ts
const { generate, isLoading, result } = useAI()

await generate({
  type: 'compose',
  phraserId: 'pro-concis',
  instructions: 'Rédige un mail de candidature pour ce poste...',
  context: selectedExperiences.value
})
```

### CV Builder

Sélection drag & drop d'expériences et génération PDF.

**Fonctionnalités** :
- Liste des expériences disponibles (depuis Nuxt Content)
- Zone de drop pour composer le CV
- Réorganisation par drag & drop (vue-draggable ou @dnd-kit)
- Sélection du template CV
- Export PDF (puppeteer côté backend ou html2canvas côté client)

**Store** (`cvBuilder.ts`) :
```ts
interface CVBuilderState {
  selectedExperiences: Experience[]
  template: 'standard' | 'compact' | 'tech'
  customSections: CVSection[]
}
```

### Phraser Manager

CRUD des profils de ton/style via l'interface.

**Fonctionnalités** :
- Liste des phrasers (base DB + phrasers système depuis Markdown)
- Formulaire création/édition (nom, description, instructions système, exemples, use cases)
- Prévisualisation : tester le phraser sur un texte exemple
- Phrasers système (depuis `content/phrasers/*.md`) : lecture seule

---

## Conventions de code

### TypeScript strict

- `strict: true` partout (frontend et backend)
- Types explicites pour tous les paramètres et retours de fonction
- Interfaces pour tous les schémas de données (Experience, Skill, Project, etc.)

### Types partagés

Définir les interfaces dans `frontend/app/types/content.ts` :
```ts
export interface Experience {
  title: string
  client: string
  role: string
  type: 'mission' | 'emploi' | 'freelance'
  startDate: string
  endDate?: string
  stack: string[]
  tags: string[]
  highlights: string[]
}

export interface Phraser {
  id: string
  title: string
  slug: string
  description: string
  useCase: string[]
  systemPrompt: string
  examples?: { input: string; output: string }[]
}
```

### Composables Vue

- Toute logique réutilisable dans un composable (`use*.ts`)
- `useContent.ts` — accès aux données Markdown via Nuxt Content
- `useAI.ts` — appels IA (encapsule `$fetch` vers `/api/v1/ai/*`)
- `useCVBuilder.ts` — logique de sélection/drag & drop
- `usePhrasers.ts` — CRUD phrasers via API

### Appels API

```ts
// CORRECT — appel backend depuis composable
const { data } = await useFetch('/api/v1/ai/compose', {
  method: 'POST',
  body: { phraserId, instructions, context }
})

// INTERDIT — jamais d'appel Anthropic direct depuis le client
// import Anthropic from '@anthropic-ai/sdk' // ← JAMAIS dans le frontend
```

### Nuxt Content v3 — Accès aux données

```ts
// Lister une collection
const experiences = await queryCollection('experiences').all()

// Filtrer
const filtered = await queryCollection('experiences')
  .where('tags', 'CONTAINS', 'fullstack')
  .order('startDate', 'DESC')
  .all()

// Récupérer un document
const xp = await queryCollection('experiences').path('/experiences/mon-projet').first()
```

### Service Claude (backend)

```ts
// backend/app/services/claude_service.ts
import Anthropic from '@anthropic-ai/sdk'

export class ClaudeService {
  private client = new Anthropic({ apiKey: env.get('ANTHROPIC_API_KEY') })
  private model = env.get('ANTHROPIC_MODEL', 'claude-sonnet-4-5')

  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    return response.content[0].type === 'text' ? response.content[0].text : ''
  }
}
```

---

## Workflow IA — Pattern standard

Pour chaque génération IA, suivre ce pattern :

### 1. Filtrer les contenus pertinents (frontend)

```ts
// useAI.ts — avant d'appeler le backend
const relevantExperiences = await queryCollection('experiences')
  .where('tags', 'CONTAINS_ANY', missionTags)
  .order('startDate', 'DESC')
  .limit(5)
  .all()
```

### 2. Construire le contexte (frontend → backend)

Le frontend envoie au backend :
```ts
{
  type: 'generate-dt' | 'compose' | 'rewrite',
  phraserId: string,
  template?: string,           // structure du DT cible
  missionContext?: string,     // contexte de la mission
  experiences: Experience[],   // expériences filtrées (contenu complet)
  freeInstructions?: string,   // instructions libres de l'utilisateur
  blockToRewrite?: string      // pour le cas 'rewrite'
}
```

### 3. Appel API Claude (backend only)

```ts
// backend/app/controllers/ai_controller.ts
async generateDT({ request, auth }: HttpContext) {
  const user = await auth.getUserOrFail()
  const payload = await request.validateUsing(generateDTValidator)

  const phraser = await Phraser.findOrFail(payload.phraserId)

  const systemPrompt = buildSystemPrompt(phraser)
  const userMessage = buildDTMessage(payload.experiences, payload.template, payload.missionContext)

  const result = await claudeService.generate(systemPrompt, userMessage)

  return { result, tokensUsed: /* ... */ }
}
```

### 4. Review humaine (frontend)

- Le résultat est toujours retourné comme texte éditable
- L'utilisateur peut modifier avant de copier/exporter
- Pas de sauvegarde automatique côté serveur

---

## Variables d'environnement

### Backend `.env`

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=<node ace generate:key>
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=hisho

SESSION_DRIVER=cookie

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

### Frontend `.env`

```env
API_URL=http://localhost:3333
```

---

## Commandes de développement

### Backend (AdonisJS)

```bash
cd backend

npm run dev                              # Dev server avec HMR
npm test                                 # Tests Japa
npm run lint && npm run format           # Qualité code
npm run typecheck                        # Vérification TypeScript

node ace migration:run                   # Migrations DB
node ace migration:fresh                 # Reset + migrate
node ace make:migration <name>           # Nouvelle migration
node ace make:model <name>               # Nouveau modèle
node ace make:controller <name>          # Nouveau controller
node ace make:service <name>             # Nouveau service
```

### Frontend (Nuxt)

```bash
cd frontend

npm run dev                              # Dev server (http://localhost:3000)
npm run build                            # Build production
npm run preview                          # Prévisualiser le build

npx shadcn-vue@latest add <component>    # Ajouter un composant shadcn
```

### Docker Compose

```bash
docker-compose up -d                     # Démarrer tous les services
docker-compose up --build                # Rebuild + démarrer
docker-compose down                      # Arrêter
docker-compose logs -f backend           # Logs backend
```

---

## Phases de développement

### Phase 1 — Structure content + Content Browser

- [ ] Installer et configurer `@nuxt/content` v3
- [ ] Définir les collections dans `content.config.ts`
- [ ] Créer les fichiers Markdown d'exemple (2-3 par type)
- [ ] Implémenter `useContent.ts` avec les queries typées
- [ ] Pages Content Browser (liste + filtres + détail)
- [ ] Composants de card pour chaque type de contenu

### Phase 2 — AI Assistant basique

- [ ] Installer `@anthropic-ai/sdk` dans le backend
- [ ] Créer `ClaudeService` + variables d'environnement
- [ ] Routes `/api/v1/ai/*` avec validation VineJS
- [ ] Modèle `Phraser` + migration + CRUD routes
- [ ] Composable `useAI.ts` côté frontend
- [ ] Page AI Assistant avec les 3 cas d'usage
- [ ] Intégration phraser (sélection + chargement depuis DB)

### Phase 3 — CV Builder drag & drop + export PDF

- [ ] Store `cvBuilder.ts` (sélection d'expériences)
- [ ] Interface drag & drop (vue-draggable ou @dnd-kit/core)
- [ ] Templates CV en HTML/CSS (standard, compact, tech)
- [ ] Route backend `/api/v1/cv/export` → génération PDF
- [ ] Page CV Builder complète

### Phase 4 — Phraser Manager + raffinements UX

- [ ] Page Phraser Manager (CRUD complet)
- [ ] Formulaire création/édition avec prévisualisation
- [ ] Import phrasers depuis fichiers Markdown (read-only)
- [ ] Améliorations UX : transitions, raccourcis, responsive
- [ ] Streaming des réponses IA (SSE ou streaming $fetch)

---

## Notes importantes

- **Sécurité** : La clé API Anthropic ne doit jamais être exposée côté client. Tout appel LLM passe par le backend AdonisJS.
- **Auth** : Toutes les routes `/api/v1/ai/*` et `/api/v1/phrasers/*` nécessitent `middleware.auth()`.
- **Nuxt Content** : Les fichiers Markdown sont en lecture seule depuis l'app. Les modifications se font directement dans `content/` (éditeur texte ou IDE).
- **Phrasers** : Deux sources — fichiers Markdown système (`content/phrasers/`) en lecture seule + phrasers utilisateur en base PostgreSQL.
- **PDF** : Privilégier la génération côté serveur (puppeteer) pour une fidélité maximale au rendu CSS.
- **Streaming** : Pour l'UX IA, implémenter le streaming des réponses via Server-Sent Events (AdonisJS supporte les streams natifs).

---

## Architecture existante conservée

Toute la configuration existante (auth, CORS, middleware, transitions, Docker) décrite dans le CLAUDE.md initial reste valide. Les sections ci-dessus viennent s'y ajouter pour spécifier le périmètre fonctionnel de Hisho.

### Backend — Middleware stack

- Server : `container_bindings`, `force_json_response`, `cors`
- Router : `bodyparser`, `session`, `initialize_auth`
- Named : `auth`, `guest`, `silent_auth`

### Frontend — Transitions disponibles

`page` (horizontal), `slide` (vertical), `fade`, `scale` — configurables via `definePageMeta({ pageTransition: { name: '...', mode: 'out-in' } })`

### Import aliases backend

`#controllers/*`, `#models/*`, `#services/*`, `#middleware/*`, `#validators/*`, `#start/*`, `#config/*`, `#database/*`
