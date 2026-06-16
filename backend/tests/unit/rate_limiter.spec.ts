import { test } from '@japa/runner'
import { RateLimiter } from '#services/rate_limiter'

const cfg = { maxPerIp: 2, windowMs: 1000, maxGlobal: 3, globalWindowMs: 1000 }

test.group('RateLimiter', () => {
  test('allows requests under the per-IP limit', ({ assert }) => {
    const rl = new RateLimiter()
    assert.isTrue(rl.check('1.1.1.1', cfg, 0).allowed)
    assert.isTrue(rl.check('1.1.1.1', cfg, 10).allowed)
  })

  test('blocks once per-IP limit is reached within the window', ({ assert }) => {
    const rl = new RateLimiter()
    rl.check('1.1.1.1', cfg, 0)
    rl.check('1.1.1.1', cfg, 10)
    const res = rl.check('1.1.1.1', cfg, 20)
    assert.isFalse(res.allowed)
    assert.isNumber(res.retryAfter)
  })

  test('purges hits outside the per-IP window', ({ assert }) => {
    const rl = new RateLimiter()
    rl.check('1.1.1.1', cfg, 0)
    rl.check('1.1.1.1', cfg, 10)
    // window is 1000ms; at t=1500 the earlier hits expired
    assert.isTrue(rl.check('1.1.1.1', cfg, 1500).allowed)
  })

  test('per-IP limits are independent across IPs', ({ assert }) => {
    const rl = new RateLimiter()
    rl.check('1.1.1.1', cfg, 0)
    rl.check('1.1.1.1', cfg, 1)
    assert.isFalse(rl.check('1.1.1.1', cfg, 2).allowed)
    assert.isTrue(rl.check('2.2.2.2', cfg, 3).allowed)
  })

  test('enforces the global cap across all IPs', ({ assert }) => {
    const rl = new RateLimiter()
    rl.check('1.1.1.1', cfg, 0)
    rl.check('2.2.2.2', cfg, 1)
    rl.check('3.3.3.3', cfg, 2)
    // global cap is 3 -> 4th distinct request blocked even though IP is fresh
    assert.isFalse(rl.check('4.4.4.4', cfg, 3).allowed)
  })

  test('reset clears all state', ({ assert }) => {
    const rl = new RateLimiter()
    rl.check('1.1.1.1', cfg, 0)
    rl.check('1.1.1.1', cfg, 1)
    rl.reset()
    assert.isTrue(rl.check('1.1.1.1', cfg, 2).allowed)
  })
})
