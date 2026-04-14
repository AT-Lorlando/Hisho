# Refonte UX & Modèle de compétences — Hisho

## Goal

Rendre l'app cohérente visuellement, en français, et adapter le modèle de données pour un profil technique large-spectre où les compétences sont saisies de façon brute/factuelle et présentées par l'IA.

## Architecture générale

### Routing & layouts

- **`/`** → redirection pure : connecté → `/profile`, non connecté → `/login`. Aucune homepage neutre.
- **`/login`** et **`/register`** → layout `default.vue` (centré, fond neutre). En français. Branding Hisho visible.
- **`/profile/**`** → layout `profile.vue` (sidebar + main). Protégé par `profile-guard.global.ts` (déjà en place).

### Layout `default.vue`

Layout utilisé pour les pages auth. Fond `bg-background`, slot centré verticalement et horizontalement. Simple.

### Layout `profile.vue`

Améliorations visuelles uniquement (pas de changement structurel) :
- En-tête sidebar : logo/titre "Hisho" + lien vers `/profile`
- Pied de sidebar : nom d'utilisateur + bouton déconnexion
- Section "Domaines" dans la sidebar (entre Identité et Expériences)

---

## Pages auth

### `/login`

- Titre : "Hisho"
- Sous-titre : "Votre portfolio technique, augmenté par l'IA"
- Formulaire : email + mot de passe + bouton "Se connecter"
- Lien : "Pas encore de compte ? S'inscrire"
- Redirection après login : `/profile`

### `/register`

- Même branding
- Formulaire : nom complet + email + mot de passe + bouton "Créer mon compte"
- Lien : "Déjà un compte ? Se connecter"
- Redirection après register : `/profile`

---

## Modèle de compétences : Domaines → Compétences

### Principe

Les compétences appartiennent à un **domaine** libre défini par l'utilisateur. Un domaine est une ligne dans `content/domains/`. Les compétences ont un champ `domain` (texte libre avec autocomplete sur les domaines existants).

Pas de catégorie imposée, pas de niveau dropdown. L'IA infère le niveau depuis le contexte du corps.

### Entité Domaine — `content/domains/*.md`

```yaml
---
title: "Cybersécurité"
description: "SOC, pentest, SIEM, CTF, PKI"
order: 2
---

Notes libres sur ce domaine, positionnement, spécialisation...
```

Champs :
- `title` (string, requis)
- `description` (string, optionnel — phrase courte)
- `order` (number, optionnel — ordre d'affichage dans les DTs)
- `body` (Markdown libre)

### Entité Compétence — `content/skills/*.md` (simplifié)

```yaml
---
title: "ELK Stack"
domain: "Cybersécurité"
yearsOfExperience: 3
---

3 déploiements ELK sur systèmes sensibles (prod). Ingestion multi-sources (syslog, beats, API), dashboards Kibana custom, alerting Watcher. Utilisé en contexte SOC pour la détection d'anomalies.
```

Champs conservés :
- `title` (string, requis)
- `domain` (string, requis — texte libre, autocomplete)
- `yearsOfExperience` (number, optionnel)
- `body` (Markdown libre — contexte, projets associés, niveau implicite)

Champs supprimés : `category`, `level`, `tags`, `lastUsed`, `contexts`.

---

## Formulaires simplifiés

### SkillForm

```
Compétence *           [input]
Domaine *              [input avec autocomplete sur les domaines existants]
Années d'expérience    [number input]
Contexte (Markdown)    [textarea — libre, factuel, brut]
```

### ExperienceForm

Champs conservés : `title`, `client`, `role`, `startDate`, `endDate`, `location`, `stack`, `highlights`, `body`.
Champ supprimé : `type` (mission/emploi/freelance) — non pertinent pour les DTs.

### ProjectForm

Champs conservés : `title`, `stack`, `startDate`, `endDate`, `url`, `body`.
Champs supprimés : `type`, `status`, `tags`, `demo`.

### CertificationForm

Inchangé.

---

## Nouveau — DomainForm

```
Nom du domaine *       [input]
Description courte     [input — une ligne]
Ordre d'affichage      [number input]
Notes (Markdown)       [textarea]
```

---

## Navigation profil (sidebar)

Sections dans l'ordre :
1. Identité
2. **Domaines** ← nouveau
3. Compétences
4. Expériences
5. Projets
6. Certifications

---

## Conséquences techniques

### Frontend

- `content.config.ts` : ajouter collection `domains`, simplifier collection `skills`
- `app/types/content.ts` : ajouter `Domain`, `DomainPayload`; simplifier `Skill`, `SkillPayload`; simplifier `Experience`, `Project`
- `app/components/content/SkillForm.vue` : refonte complète
- `app/components/content/ExperienceForm.vue` : retirer champ `type`
- `app/components/content/ProjectForm.vue` : retirer `type`, `status`, `tags`, `demo`
- `app/components/content/DomainForm.vue` : nouveau composant
- `app/pages/profile/domains/` : `index.vue`, `new.vue`, `edit/[slug].vue` — nouvelles pages
- `app/components/profile/ProfileSidebar.vue` : ajouter entrée Domaines + footer user
- `app/pages/login.vue` / `register.vue` : refonte visuelle, français
- `app/pages/index.vue` : remplacer par redirection intelligente
- `app/layouts/default.vue` : layout centré pour pages auth

### Backend

- `backend/app/validators/content.ts` : simplifier validators `skill`, `experience`, `project`; ajouter validator `domain`
- `start/routes.ts` : ajouter routes `POST/PUT/DELETE /content/domains`

---

## Ce qui ne change pas

- Modèle `Experience` (champs structurels : client, role, dates, stack, highlights)
- Modèle `Certification`
- Toute la logique auth backend
- ContentService, ContentController, ProfileController
- Les fichiers Markdown existants (les champs supprimés sont ignorés, pas d'erreur)

---

## Hors scope

- Génération de DTs (Phase 2 du projet)
- Assistant IA
- CV Builder
- Streaming SSE
