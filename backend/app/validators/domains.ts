import vine from '@vinejs/vine'

export const createDomainValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    description: vine.string().trim().optional(),
    order: vine.number().optional(),
    body: vine.string().optional(),
  })
)

export const updateDomainValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    description: vine.string().trim().optional(),
    order: vine.number().optional(),
    body: vine.string().optional(),
  })
)
