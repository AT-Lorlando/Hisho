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
