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
