import vine from '@vinejs/vine'

export const createMissionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    type: vine.enum(['pro', 'perso']),
    experience: vine.string().trim().optional(),
    client: vine.string().trim().optional(),
    domains: vine.array(vine.string().trim()).optional(),
    skills: vine.array(vine.string().trim()).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    body: vine.string().optional(),
  })
)

export const updateMissionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    type: vine.enum(['pro', 'perso']),
    experience: vine.string().trim().optional(),
    client: vine.string().trim().optional(),
    domains: vine.array(vine.string().trim()).optional(),
    skills: vine.array(vine.string().trim()).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    body: vine.string().optional(),
  })
)
