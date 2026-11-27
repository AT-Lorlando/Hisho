import pino from 'pino'
import { getRequestHeader, type H3Event } from 'h3'

export const logger = pino({
  base: { app: 'hisho', service: 'frontend', env: process.env.NODE_ENV === 'production' ? 'prod' : 'dev' },
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['password', '*.password', 'token', '*.token', 'authorization', '*.authorization'],
})

/** Request logger: carries request_id (X-Request-Id from nginx, otherwise generated). */
export function useRequestLogger(event: H3Event) {
  return (event.context.log ??= logger.child({ request_id: event.context.requestId ?? getRequestHeader(event, 'x-request-id') }))
}
