import vine from '@vinejs/vine'

export const updateCompetencyValidator = vine.compile(
  vine.object({
    level: vine.number().min(1).max(5),
  })
)
