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
  console.log(`[${req.logId}] ${shortStackTrace(err)}`) // eslint-disable-line no-console
  res.statusCode = 500
  res.end()
}
