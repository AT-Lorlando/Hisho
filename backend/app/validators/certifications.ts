import vine from '@vinejs/vine'

export const createCertificationValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    organism: vine.string().trim().minLength(1),
    date: vine.string().trim().minLength(1),
    expiry: vine.string().trim().optional(),
    credentialId: vine.string().trim().optional(),
    url: vine.string().trim().optional(),
    tags: vine.array(vine.string().trim()).optional(),
    body: vine.string().optional(),
  })
)

export const updateCertificationValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    organism: vine.string().trim().minLength(1),
    date: vine.string().trim().minLength(1),
    expiry: vine.string().trim().optional(),
    credentialId: vine.string().trim().optional(),
    url: vine.string().trim().optional(),
    tags: vine.array(vine.string().trim()).optional(),
    body: vine.string().optional(),
  })
)
