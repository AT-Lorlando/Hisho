import vine from '@vinejs/vine'

export const extractValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1),
  })
)

const skillEntryRule = vine.object({
  name: vine.string().trim().minLength(1),
  level: vine.number().withoutDecimals().min(1).max(5),
})

const extractedSkillRule = vine.object({
  name: vine.string().trim().minLength(1),
  level: vine.number().withoutDecimals().min(1).max(5),
  domain: vine.string().trim().nullable().optional(),
})

const extractedMissionRule = vine.object({
  title: vine.string().trim().minLength(1),
  client: vine.string().trim().nullable().optional(),
  startDate: vine.string().trim().nullable().optional(),
  endDate: vine.string().trim().nullable().optional(),
  domains: vine.array(skillEntryRule).optional(),
  skills: vine.array(extractedSkillRule).optional(),
  body: vine.string().nullable().optional(),
})

const extractedExperienceRule = vine.object({
  title: vine.string().trim().minLength(1),
  role: vine.string().trim().optional(),
  client: vine.string().trim().nullable().optional(),
  type: vine.enum(['cdi', 'cdd', 'freelance', 'alternance', 'stage']).optional(),
  startDate: vine.string().trim().nullable().optional(),
  endDate: vine.string().trim().nullable().optional(),
  body: vine.string().nullable().optional(),
  missions: vine.array(extractedMissionRule).optional(),
})

export const importValidator = vine.compile(
  vine.object({
    experiences: vine.array(extractedExperienceRule).optional(),
    missions: vine.array(extractedMissionRule).optional(),
  })
)
