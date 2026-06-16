export interface RateLimitConfig {
  maxPerIp: number
  windowMs: number
  maxGlobal: number
  globalWindowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number // seconds
}

/**
 * In-memory sliding-window rate limiter.
 * Keeps request timestamps per IP and a global list, purging expired entries
 * on each check. State is process-local (single instance) — sufficient for a
 * personal app; not shared across multiple backend instances.
 */
export class RateLimiter {
  private perIp = new Map<string, number[]>()
  private global: number[] = []

  private static purge(hits: number[], cutoff: number): number[] {
    let i = 0
    while (i < hits.length && hits[i] <= cutoff) i++
    return i > 0 ? hits.slice(i) : hits
  }

  check(ip: string, cfg: RateLimitConfig, now: number = Date.now()): RateLimitResult {
    const ipHits = RateLimiter.purge(this.perIp.get(ip) ?? [], now - cfg.windowMs)
    const globalHits = RateLimiter.purge(this.global, now - cfg.globalWindowMs)

    if (ipHits.length >= cfg.maxPerIp) {
      const retryAfter = Math.ceil((ipHits[0] + cfg.windowMs - now) / 1000)
      this.perIp.set(ip, ipHits)
      this.global = globalHits
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) }
    }

    if (globalHits.length >= cfg.maxGlobal) {
      const retryAfter = Math.ceil((globalHits[0] + cfg.globalWindowMs - now) / 1000)
      this.perIp.set(ip, ipHits)
      this.global = globalHits
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) }
    }

    ipHits.push(now)
    globalHits.push(now)
    this.perIp.set(ip, ipHits)
    this.global = globalHits
    return { allowed: true }
  }

  reset(): void {
    this.perIp.clear()
    this.global = []
  }
}

export const rateLimiter = new RateLimiter()
