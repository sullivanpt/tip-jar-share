import { resStatus } from './connect-helpers'

/**
 * max 3 requests per second
 */
const rateExpiresMs = 3 * 1000

/**
 * time last request let through
 */
let lastRequest = Date.now()

/**
 * enforce an absolute rate limit on the number of API
 * requests through this route
 */
export default function rateLimiter(req, res, next) {
  const now = Date.now()
  if (lastRequest + rateExpiresMs > now) return resStatus(res, 429)
  lastRequest = now
  next()
}
