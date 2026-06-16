import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import { rateLimiter, type RateLimitConfig } from '#services/rate_limiter'

function configFromEnv(): RateLimitConfig {
  return {
    maxPerIp: env.get('AI_CHAT_MAX_PER_IP', 20),
    windowMs: env.get('AI_CHAT_WINDOW_SECONDS', 3600) * 1000,
    maxGlobal: env.get('AI_CHAT_MAX_GLOBAL', 500),
    globalWindowMs: env.get('AI_CHAT_GLOBAL_WINDOW_SECONDS', 86400) * 1000,
  }
}

export default class AiRateLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const result = rateLimiter.check(ctx.request.ip(), configFromEnv())
    if (!result.allowed) {
      ctx.response.header('Retry-After', String(result.retryAfter ?? 60))
      return ctx.response.tooManyRequests({
        message: "Limite d'utilisation atteinte. Réessaie plus tard.",
      })
    }
    return next()
  }
}
