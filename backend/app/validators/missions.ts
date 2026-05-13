import vine from '@vinejs/vine'

const skillEntryRule = vine.object({
  name: vine.string().trim().minLength(1),
  level: vine.number().withoutDecimals().min(1).max(5),
})

export const createMissionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    type: vine.enum(['pro', 'perso']).optional(),
    experience: vine.string().trim().optional(),
    client: vine.string().trim().optional(),
    domains: vine.array(skillEntryRule).optional(),
    skills: vine.array(skillEntryRule).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    body: vine.string().optional(),
  })
)

export const updateMissionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    type: vine.enum(['pro', 'perso']).optional(),
    experience: vine.string().trim().optional(),
    client: vine.string().trim().optional(),
    domains: vine.array(skillEntryRule).optional(),
    skills: vine.array(skillEntryRule).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    body: vine.string().optional(),
  })
)
