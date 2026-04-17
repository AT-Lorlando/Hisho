import vine from '@vinejs/vine'

export const createSkillValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    domain: vine.string().trim().minLength(1),
    yearsOfExperience: vine.number().optional(),
    body: vine.string().optional(),
  })
)

export const updateSkillValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    domain: vine.string().trim().minLength(1),
    yearsOfExperience: vine.number().optional(),
    body: vine.string().optional(),
  })
)
