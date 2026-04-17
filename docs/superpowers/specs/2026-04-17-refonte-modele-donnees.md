# Refonte modèle de données — Expériences, Missions, Compétences

## Objectif

Restructurer le modèle de données pour refléter la réalité du profil technique :
- Une **expérience professionnelle** est un employeur (CDI, CDD, freelance…)
- Une **mission** est un projet concret mené dans ce cadre, ou un projet personnel
- Les **compétences** et **domaines** restent inchangés
- L'utilisateur peut noter son niveau sur chaque compétence et domaine (stocké en base)

---

## Collections Markdown

### Vue d'ensemble

```
content/
├── experiences/    # employeurs
├── missions/       # toutes les missions (pro + perso)
├── skills/         # compétences (inchangé)
├── domains/        # domaines (inchangé)
└── certifications/ # (inchangé)
```

`content/projects/` est supprimé — les anciens projets perso deviennent des missions avec `type: perso`.

---

### `content/experiences/*.md` — Employeurs

```yaml
---
title: "Neverhack"
role: "Ingénieur DevSecOps / Responsable Technique Sécurité"
client: "Airbus Defence and Space"
type: "cdi"          # cdi | cdd | freelance | alternance | stage
startDate: "2023-01"
endDate: null        # null = en cours
location: "Toulouse"
missions:
  - "deploiement-siem-elk"
  - "outil-gestion-vulnerabilites"
  - "plateforme-audit-si"
---

Contexte général de l'entreprise / de la mission longue durée.
```

Champs :
- `title` (string, requis)
- `role` (string) — poste occupé
- `client` (string) — client final si ESN/prestataire
- `type` (cdi|cdd|freelance|alternance|stage, requis)
- `startDate` (string)
- `endDate` (string, null = en cours)
- `location` (string)
- `missions` (string[]) — slugs des missions liées
- `body` (Markdown libre)

---

### `content/missions/*.md` — Missions pro et perso

```yaml
---
title: "Déploiement SIEM ELK"
type: "pro"              # pro | perso
experience: "neverhack"  # slug de l'expérience parente — absent si perso
client: "Airbus Defence and Space"  # client final direct — absent si perso
domains:
  - "Cybersécurité"
  - "Infrastructure"
skills:
  - "ELK Stack"
  - "Docker"
  - "Python"
startDate: "2023-06"
endDate: null
---

Description brute et factuelle. Contexte, chiffres, ce qui distingue.
```

Champs :
- `title` (string, requis)
- `type` (pro|perso, requis)
- `experience` (string) — slug de l'expérience parente, absent si `type: perso`
- `client` (string) — client final direct, absent si `type: perso`
- `domains` (string[]) — noms de domaines (autocomplete sur `content/domains/`)
- `skills` (string[]) — noms de compétences (autocomplete sur `content/skills/`)
- `startDate` (string)
- `endDate` (string, null = en cours)
- `body` (Markdown libre)

---

### `content/skills/*.md` — Inchangé

```yaml
---
title: "ELK Stack"
domain: "Cybersécurité"
yearsOfExperience: 3
---

Contexte d'utilisation libre.
```

### `content/domains/*.md` — Inchangé

```yaml
---
title: "Cybersécurité"
description: "SOC, pentest, SIEM, CTF, PKI"
order: 2
---
```

### `content/certifications/*.md` — Inchangé

---

## Backend AdonisJS

### ContentService

- `VALID_CONTENT_TYPES` : ajouter `'missions'`, retirer `'projects'`
- Les routes CRUD existantes `POST/PUT/DELETE /content/:type` couvrent tout sans modification supplémentaire

### Validators (`backend/app/validators/content.ts`)

Deux nouveaux validators stricts (en plus du validator générique existant) :

**experienceValidator** :
```ts
{
  title: vine.string().trim(),
  role: vine.string().trim().optional(),
  client: vine.string().trim().optional(),
  type: vine.enum(['cdi', 'cdd', 'freelance', 'alternance', 'stage']),
  startDate: vine.string().trim().optional(),
  endDate: vine.string().trim().optional(),
  location: vine.string().trim().optional(),
  missions: vine.array(vine.string()).optional(),
  body: vine.string().optional(),
}
```

**missionValidator** :
```ts
{
  title: vine.string().trim(),
  type: vine.enum(['pro', 'perso']),
  experience: vine.string().trim().optional(),
  client: vine.string().trim().optional(),
  domains: vine.array(vine.string()).optional(),
  skills: vine.array(vine.string()).optional(),
  startDate: vine.string().trim().optional(),
  endDate: vine.string().trim().optional(),
  body: vine.string().optional(),
}
```

---

### Table `competency_ratings`

```sql
id       integer  PK autoincrement
user_id  integer  FK → users.id  NOT NULL
type     varchar  NOT NULL  -- 'skill' | 'domain'
slug     varchar  NOT NULL
level    integer  NOT NULL  -- 1 à 5 (1=Notions, 2=Débutant, 3=Intermédiaire, 4=Avancé, 5=Expert)
UNIQUE(user_id, type, slug)
```

Migration AdonisJS : `create_competency_ratings_table`

Modèle Lucid : `CompetencyRating` avec `belongsTo(User)`.

---

### Routes compétences

```
GET    /api/v1/competencies              # tous les ratings de l'user connecté
PUT    /api/v1/competencies/:type/:slug  # upsert un rating (createOrUpdate)
DELETE /api/v1/competencies/:type/:slug  # supprimer un rating
```

Toutes protégées par `middleware.auth()`.

**GET** : retourne `{ skills: { "elk-stack": 4, "nuxt": 5 }, domains: { "cybersecurite": 3 } }`

**PUT body** : `{ level: integer (1-5) }`

---

### Validator compétences (`backend/app/validators/competency.ts`)

```ts
// PUT /competencies/:type/:slug
const updateCompetencyValidator = vine.compile(
  vine.object({ level: vine.number().min(1).max(5) })
)
```

Params `:type` validé contre `['skill', 'domain']`.

---

## Ce qui ne change pas

- Auth backend (routes, middleware, modèle User)
- ContentService (logique lecture/écriture fichiers)
- ContentController
- ProfileController et modèle `UserProfile`
- Collections `skills`, `domains`, `certifications`
- Nuxt Content config pour `skills`, `domains`, `certifications`

## Hors scope

- Frontend (pages missions, expériences, UI notation niveaux)
- Génération de DTs
- Migration des fichiers Markdown existants
