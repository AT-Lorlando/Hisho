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

const extractedMissionRule = vine.object({
  title: vine.string().trim().minLength(1),
  client: vine.string().trim().nullable().optional(),
  domains: vine.array(skillEntryRule).optional(),
  skills: vine.array(skillEntryRule).optional(),
  body: vine.string().nullable().optional(),
})

const extractedExperienceRule = vine.object({
  title: vine.string().trim().minLength(1),
  role: vine.string().trim().optional(),
  client: vine.string().trim().nullable().optional(),
  type: vine.enum(['cdi', 'cdd', 'freelance', 'alternance', 'stage']).optional(),
  body: vine.string().nullable().optional(),
  missions: vine.array(extractedMissionRule).optional(),
})

export const importValidator = vine.compile(
  vine.object({
    experiences: vine.array(extractedExperienceRule).optional(),
    missions: vine.array(extractedMissionRule).optional(),
  })
)
