import { randomUUID } from 'node:crypto'

export default defineEventHandler((event) => {
  const id = getRequestHeader(event, 'x-request-id') || randomUUID()
  event.context.requestId = id
  setResponseHeader(event, 'x-request-id', id)
})
