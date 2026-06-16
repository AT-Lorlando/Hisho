import vine from '@vinejs/vine'

export const chatValidator = vine.compile(
  vine.object({
    messages: vine
      .array(
        vine.object({
          role: vine.enum(['user', 'assistant']),
          content: vine.string().trim().minLength(1).maxLength(4000),
        })
      )
      .minLength(1)
      .maxLength(40),
  })
)
