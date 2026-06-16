import vine from '@vinejs/vine'

export const createSkillValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    domainSlug: vine.string().trim().optional(),
    level: vine.number().withoutDecimals().min(1).max(5).optional(),
    yearsOfExperience: vine.number().optional(),
    body: vine.string().optional(),
  })
)

export const updateSkillValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    domainSlug: vine.string().trim().optional(),
    level: vine.number().withoutDecimals().min(1).max(5).optional(),
    yearsOfExperience: vine.number().optional(),
    body: vine.string().optional(),
  })
)
