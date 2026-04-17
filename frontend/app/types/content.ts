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
