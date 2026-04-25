export interface SkillEntry {
  name: string
  level: 1 | 2 | 3 | 4 | 5
}

export interface Domain {
  id?: number
  slug: string
  title: string
  description?: string
  order?: number
  aiSummary?: string
  body?: string
}

export interface Experience {
  id?: number
  slug: string
  title: string
  role?: string
  client?: string
  type?: 'cdi' | 'cdd' | 'freelance' | 'alternance' | 'stage'
  startDate?: string
  endDate?: string
  location?: string
  missionCount?: number
  aiSummary?: string
  body?: string
}

export interface Mission {
  id?: number
  slug: string
  title: string
  type: 'pro' | 'perso'
  experience?: string
  client?: string
  domains: SkillEntry[]
  skills: SkillEntry[]
  startDate?: string
  endDate?: string
  aiSummary?: string
  body?: string
}

export interface Skill {
  id?: number
  slug: string
  title: string
  domain: { slug: string; title: string } | null
  level?: number | null
  yearsOfExperience?: number
  aiSummary?: string
  body?: string
}

export interface Certification {
  id?: number
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
  body?: string
}

export interface MissionPayload {
  title: string
  type: 'pro' | 'perso'
  experience?: string
  client?: string
  domains?: SkillEntry[]
  skills?: SkillEntry[]
  startDate?: string
  endDate?: string
  body?: string
}

export interface SkillPayload {
  title: string
  domainSlug?: string
  level?: number
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

export interface ProfilePayload {
  fullName?: string
  title?: string
  bio?: string
  location?: string
  phone?: string
  availability?: string
  dailyRate?: string
  linkedinUrl?: string
  githubUrl?: string
  websiteUrl?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ExtractedMission {
  title: string
  client?: string | null
  startDate?: string | null
  endDate?: string | null
  domains: SkillEntry[]
  skills: SkillEntry[]
  body?: string | null
}

export interface ExtractedExperience {
  title: string
  role?: string | null
  client?: string | null
  type?: 'cdi' | 'cdd' | 'freelance' | 'alternance' | 'stage'
  startDate?: string | null
  endDate?: string | null
  body?: string | null
  missions?: ExtractedMission[]
}

export interface ExtractedProfile {
  experiences?: ExtractedExperience[]
  missions?: ExtractedMission[]
}

export interface ImportResult {
  created: string[]
  errors: string[]
}
