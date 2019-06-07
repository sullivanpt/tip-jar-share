import { resStatus } from './connect-helpers'

/**
 * Helper to return just a subset of the stack trace and as a single line
 */
function shortStackTrace(err) {
  if (!err.stack) return err.toString()
  return err.stack
    .split('\n')
    .slice(0, 3)
    .join(' ')
}

/**
 * Route handler for errors
 */
export default function handleError(err, req, res, next) {
  // 409 when update fails (usually because hash mismatch)
  if (err.message === 'TJS-CONFLICT') return resStatus(res, 409)

  console.log(`[${req.logId}] [API] ${shortStackTrace(err)}`) // eslint-disable-line no-console
  resStatus(res, 500)
}
