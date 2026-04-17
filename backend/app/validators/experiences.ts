import vine from '@vinejs/vine'

export const createExperienceValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    role: vine.string().trim().optional(),
    client: vine.string().trim().optional(),
    type: vine.enum(['cdi', 'cdd', 'freelance', 'alternance', 'stage']).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    location: vine.string().trim().optional(),
    body: vine.string().optional(),
  })
)

export const updateExperienceValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    role: vine.string().trim().optional(),
    client: vine.string().trim().optional(),
    type: vine.enum(['cdi', 'cdd', 'freelance', 'alternance', 'stage']).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    location: vine.string().trim().optional(),
    body: vine.string().optional(),
  })
)
