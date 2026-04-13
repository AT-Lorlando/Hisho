import vine from '@vinejs/vine'

export const createContentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().optional(),
  }).allowUnknownProperties()
)

export const updateContentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    body: vine.string().optional(),
  }).allowUnknownProperties()
)
