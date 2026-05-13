import env from '#start/env'

export interface ExtractedSkillEntry {
  name: string
  level: 1 | 2 | 3 | 4 | 5
}

export interface ExtractedMission {
  title: string
  client?: string | null
  startDate?: string | null
  endDate?: string | null
  domains: ExtractedSkillEntry[]
  skills: ExtractedSkillEntry[]
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

const DOMAINS_LIST = [
  'OS',
  'Langages de programmation',
  'Cybersécurité',
  'Développement Web',
  'Frameworks',
  'Bases de données',
  'DevOps',
  'Méthodes',
  'Réseaux',
  'IA & LLM',
  'IDE',
  'Graphisme',
  'Langues',
]

const EXTRACT_SYSTEM_PROMPT = `À partir du texte fourni, extrais les informations professionnelles et retourne UNIQUEMENT un JSON valide (sans explication, sans balises markdown) correspondant exactement à ce schéma :

{
  "experiences": [{
    "title": "string",
    "role": "string ou null",
    "client": "string ou null",
    "type": "cdi|cdd|freelance|alternance|stage",
    "startDate": "YYYY-MM ou null",
    "endDate": "YYYY-MM ou null (null si en cours)",
    "body": "string ou null",
    "missions": [{
      "title": "string",
      "client": "string ou null",
      "startDate": "YYYY-MM ou null",
      "endDate": "YYYY-MM ou null (null si en cours)",
      "domains": [{ "name": "string", "level": 1 }],
      "skills": [{ "name": "string", "level": 1 }],
      "body": "string ou null"
    }]
  }],
  "missions": [{
    "title": "string",
    "startDate": "YYYY-MM ou null",
    "endDate": "YYYY-MM ou null",
    "domains": [{ "name": "string", "level": 1 }],
    "skills": [{ "name": "string", "level": 1 }],
    "body": "string ou null"
  }]
}

Règles :
- level est un entier de 1 (débutant) à 5 (expert) — note honnêtement selon le contexte.
- Les expériences professionnelles (CDI, CDD, freelance, alternance, stage) vont dans "experiences".
- Les projets personnels (side projects, projets perso, open source…) vont dans "missions" (sans expérience parente).
- Pour "domains", choisis exclusivement parmi : ${DOMAINS_LIST.join(', ')}. N'invente aucun autre domaine.
- "skills" est libre (technologies, outils, langages, frameworks).
- N'inclus PAS de localisation — l'utilisateur la renseignera manuellement.
- Ne génère que les entrées dont tu es certain. Si une info est absente, utilise null.
- Retourne uniquement le JSON, rien d'autre.`

/**
 * Attempt to repair truncated / malformed JSON from the AI model.
 * Handles: unclosed strings, trailing commas, dangling "key": with no value,
 * and missing closing braces/brackets.
 */
function repairJson(raw: string): string {
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (escaped) { escaped = false; continue }
    if (inString) {
      if (c === '\\') escaped = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') { inString = true; continue }
    if (c === '{') stack.push('}')
    else if (c === '[') stack.push(']')
    else if (c === '}' && stack.at(-1) === '}') stack.pop()
    else if (c === ']' && stack.at(-1) === ']') stack.pop()
  }

  if (!inString && stack.length === 0) return raw

  let out = raw

  if (inString) out += '"'
  out = out.trimEnd()
  out = out.replace(/,\s*$/, '')
  out = out.replace(/,?\s*"(?:[^"\\]|\\.)*"\s*:\s*$/, '')
  out = out.trimEnd().replace(/,\s*$/, '')

  for (let i = stack.length - 1; i >= 0; i--) out += stack[i]

  return out
}

export class AiService {
  private baseUrl = env.get('AI_URL')
  private model = env.get('AI_MODEL')
  private apiKey = env.get('AI_API_KEY')

  private async callCompletions(
    messages: { role: string; content: string }[],
    timeoutMs = 60_000,
    maxTokens = 4096
  ): Promise<string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model: this.model, messages, max_tokens: maxTokens }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`OpenWebUI error ${res.status}: ${text}`)
      }

      const json = (await res.json()) as { choices: { message: { content: string } }[] } | null
      console.log('[AiService] parsed json:', JSON.stringify(json)?.substring(0, 200))
      if (!json) throw new Error('OpenWebUI returned empty/null response body')
      if (!json.choices?.length) throw new Error(`OpenWebUI returned no choices. Full response: ${JSON.stringify(json)}`)
      return json.choices[0]?.message?.content ?? ''
    } finally {
      clearTimeout(timer)
    }
  }

  async extract(profileText: string): Promise<ExtractedProfile> {
    const messages = [
      { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
      { role: 'user', content: profileText },
    ]
    const raw = await this.callCompletions(messages, 300_000, 16384)

    console.log('[AiService.extract] raw response length:', raw.length)
    console.log('[AiService.extract] raw response:\n', raw)

    const jsonStart = raw.search(/[{[]/)
    if (jsonStart === -1) {
      throw new SyntaxError(`AI returned no JSON. Raw: ${raw.substring(0, 200)}`)
    }

    const jsonEnd = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'))
    const full = raw.substring(jsonStart)
    const trimmed = raw.substring(jsonStart, jsonEnd + 1)
    const repaired = repairJson(full)

    const attempts = [trimmed, full, repaired, repairJson(trimmed)]

    for (const attempt of attempts) {
      try {
        return JSON.parse(attempt) as ExtractedProfile
      } catch {}
    }

    console.error('[AiService.extract] all parse attempts failed')
    const err = new SyntaxError('AI returned invalid JSON after all repair attempts.')
    ;(err as any).rawCandidate = repaired
    throw err
  }
}

export default new AiService()
