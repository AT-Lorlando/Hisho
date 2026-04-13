import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    title: vine.string().trim().optional(),
    bio: vine.string().trim().optional(),
    location: vine.string().trim().optional(),
    linkedinUrl: vine.string().trim().url().optional(),
    githubUrl: vine.string().trim().url().optional(),
    websiteUrl: vine.string().trim().url().optional(),
    phone: vine.string().trim().optional(),
    availability: vine.string().trim().optional(),
    dailyRate: vine.string().trim().optional(),
  })
)
