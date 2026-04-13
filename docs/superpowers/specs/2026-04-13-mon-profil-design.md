# Design — Page "Mon Profil"

**Date** : 2026-04-13
**Projet** : Hisho
**Périmètre** : Page de gestion du profil professionnel (infos de base + contenus Markdown)

---

## Contexte

Hisho centralise le profil pro sous deux formes :
- **Données de base** (identité, liens, disponibilité) → stockées en PostgreSQL sur le modèle `User`
- **Contenus riches** (expériences, compétences, projets, certifications) → fichiers Markdown dans `content/`, parsés par Nuxt Content v3

La page "Mon Profil" est l'interface unique pour consulter et éditer ces deux types de données.

---

## Décisions de design

| Question | Décision |
|---|---|
| Structure globale | Sidebar fixe + zone de contenu principale |
| Affichage des sections MD | Vue liste+aperçu (split) — liste compacte à gauche, preview à droite |
| Édition | Page dédiée avec breadcrumb (`/profile/:type/edit/[slug]`) |
| Bouton "Compiler" | Dans la section Identité, avec barre de progression et date |
| Écriture des fichiers MD | AdonisJS écrit les fichiers sur disque — source de vérité = filesystem |

---

## Routes frontend

Toutes les routes sous `/profile/*` utilisent le layout `app/layouts/profile.vue`.

```
/profile                          → redirect → /profile/identity
/profile/identity                 → page identité + compiler
/profile/experiences              → liste+aperçu expériences
/profile/experiences/new          → formulaire création
/profile/experiences/edit/[slug]  → formulaire édition
/profile/skills                   → liste+aperçu compétences
/profile/skills/new
/profile/skills/edit/[slug]
/profile/projects                 → liste+aperçu projets
/profile/projects/new
/profile/projects/edit/[slug]
/profile/certifications           → liste+aperçu certifications
/profile/certifications/new
/profile/certifications/edit/[slug]
```

---

## Composants

### Layout & navigation

**`app/layouts/profile.vue`**
- Sidebar `ProfileSidebar` à gauche + `<slot>` pour le contenu
- Middleware `auth` appliqué
- Structure : double nav (nav app globale icônes + sidebar profil)

**`app/components/profile/ProfileSidebar.vue`**
- Liens vers chaque section avec highlight de la section active
- Badges compteurs (nombre de fichiers MD par type)
- Reçoit les counts via `useContent()`

### Section Identité

**`app/components/profile/IdentityForm.vue`**
- Formulaire gérant tous les champs DB de l'identité
- Grille 2 colonnes pour les champs courts, pleine largeur pour bio
- Email affiché en read-only (non éditable ici)
- Submit → `PUT /api/v1/profile`

**`app/components/profile/CompileButton.vue`**
- Bouton "⚡ Compiler le profil"
- Affiche X/Y résumés générés + date de dernière compilation
- Barre de progression
- Déclenche `POST /api/v1/profile/compile`
- Gère l'état loading pendant la compilation

### Vue liste+aperçu (générique, réutilisée pour tous les types MD)

**`app/components/content/ContentSplitView.vue`**
- Shell de la vue liste+aperçu
- Props : `items`, `selectedSlug`
- Émet : `select(slug)`, `create`, `edit(slug)`, `delete(slug)`
- Panneau gauche : liste scrollable
- Panneau droit : slot pour l'aperçu

**`app/components/content/ContentListItem.vue`**
- Un item dans la liste
- Props : `title`, `meta` (string secondaire), `tags`, `hasAiSummary` (boolean)
- Pastille verte si résumé IA présent, rouge sinon
- État actif mis en évidence (bordure gauche verte)

**`app/components/content/ContentPreview.vue`**
- Panneau de prévisualisation
- Props : `item` (objet générique avec les champs communs)
- Affiche : titre, méta (dates, lieu, rôle), tags stack, bloc résumé IA (si présent), contenu Markdown rendu, réalisations
- Actions : bouton "Modifier" (→ page edit) + bouton supprimer

### Formulaires d'édition (un par type)

Chaque formulaire est une page autonome avec :
- Breadcrumb (Mon profil / Section / Titre)
- Champs spécifiques au frontmatter du type
- Boutons "Annuler" (→ retour liste) et "Sauvegarder → MD"
- Submit → `POST` ou `PUT /api/v1/content/:type[/:slug]`

**`app/components/content/ExperienceForm.vue`**
Champs : `title`*, `client`*, `role`*, `type` (select), `startDate`*, `endDate`, `location`, `stack` (tags input), `tags` (tags input), `description` (textarea Markdown), `highlights` (textarea, une par ligne)

**`app/components/content/SkillForm.vue`**
Champs : `title`*, `category` (select), `level` (select), `tags`, `yearsOfExperience`, `lastUsed`, `contexts` (textarea)

**`app/components/content/ProjectForm.vue`**
Champs : `title`*, `type` (select), `status` (select), `startDate`, `endDate`, `stack` (tags), `tags`, `url`, `demo`, `description`

**`app/components/content/CertificationForm.vue`**
Champs : `title`*, `organism`*, `date`*, `expiry`, `credentialId`, `url`, `tags`, `body` (textarea notes)

---

## Composables

**`app/composables/useProfile.ts`**
```ts
// Lecture et mise à jour du profil DB
const { profile, isLoading, update } = useProfile()
// GET /api/v1/profile → hydrate profile
// update(data) → PUT /api/v1/profile
```

**`app/composables/useContent.ts`**
```ts
// Lecture des fichiers MD via Nuxt Content
const { items, count } = useContent('experiences')
// queryCollection('experiences').all()
// count = nombre d'items pour ce type
```

**`app/composables/useContentCounts.ts`**
```ts
// Counts pour tous les types — utilisé par ProfileSidebar
const counts = useContentCounts()
// { experiences: 3, skills: 12, projects: 5, certifications: 2 }
// Exécute 4 queryCollection().count() en parallèle
```

**`app/composables/useContentFile.ts`**
```ts
// Écriture/suppression des fichiers MD via AdonisJS
const { create, update, remove } = useContentFile('experiences')
// create(data) → POST /api/v1/content/experiences
// update(slug, data) → PUT /api/v1/content/experiences/:slug
// remove(slug) → DELETE /api/v1/content/experiences/:slug
```

---

## API AdonisJS — nouvelles routes

Toutes les routes sont protégées par `middleware.auth()`.

```
GET    /api/v1/profile                    → lire profil DB (User étendu)
PUT    /api/v1/profile                    → mettre à jour profil DB
POST   /api/v1/profile/compile            → lancer compilation IA (génère les résumés)

POST   /api/v1/content/:type              → créer un fichier MD
PUT    /api/v1/content/:type/:slug        → modifier un fichier MD
DELETE /api/v1/content/:type/:slug        → supprimer un fichier MD
```

> **Lecture des fichiers** : toujours via `queryCollection()` de Nuxt Content (côté client ou serveur Nuxt). AdonisJS n'expose pas de route GET pour le contenu — il n'est responsable que des écritures.

`:type` ∈ `['experiences', 'skills', 'projects', 'certifications']`

Le `ContentService` (backend) est responsable de :
- Sérialiser un objet JS en frontmatter YAML + corps Markdown
- Lire/écrire les fichiers dans le dossier `content/:type/`
- Générer le `slug` depuis le titre (kebab-case)

---

## Migration base de données

Ajout de colonnes sur la table `users` existante :

```ts
// migration: add_profile_fields_to_users
table.string('title').nullable()
table.text('bio').nullable()
table.string('location').nullable()
table.string('linkedin_url').nullable()
table.string('github_url').nullable()
table.string('website_url').nullable()
table.string('phone').nullable()
table.string('availability').nullable()          // "Disponible" | "En mission" | "À l'écoute"
table.string('daily_rate').nullable()            // stocké en string (usage privé)
table.timestamp('last_compiled_at').nullable()   // date dernière compilation IA
```

---

## Workflow "Compiler le profil"

1. Clic sur "⚡ Compiler le profil" → `POST /api/v1/profile/compile`
2. AdonisJS liste tous les fichiers MD (experiences, skills, projects, certifications)
3. Pour chaque fichier sans résumé IA (ou si force=true) :
   - Lit le contenu du fichier
   - Envoie à Claude : "Génère un résumé de 2-3 phrases de cette expérience"
   - Injecte le résumé dans le frontmatter (`aiSummary: "..."`)
   - Réécrit le fichier
4. Met à jour `lastCompiledAt` sur le User
5. Retourne `{ compiled: N, total: M }`

> La compilation est asynchrone. Pour la Phase 1, elle est synchrone (acceptable pour un usage personnel avec peu de fichiers). Le streaming/SSE est prévu en Phase 4.

---

## Contraintes techniques

- **Nuxt Content v3** doit être installé dans le frontend (`@nuxt/content`)
- Les collections doivent être définies dans `frontend/content.config.ts`
- Le dossier `content/` est à la racine du monorepo, accessible par AdonisJS ET par Nuxt Content (via volume Docker ou symlink en dev)
- **Jamais d'appel Anthropic direct depuis le client** — la compilation passe exclusivement par AdonisJS
- Les formulaires valident les champs requis côté client (VeeValidate ou validation manuelle) avant envoi

---

## Ce qui est hors scope

- Nuxt Content Studio ou éditeur Markdown enrichi (WYSIWYG) — le textarea suffit
- Upload d'avatar / photo de profil
- Historique des versions des fichiers MD
- Prévisualisation live du Markdown dans les formulaires (Phase 4)
- Streaming de la compilation IA (Phase 4)
