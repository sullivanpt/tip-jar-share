// TODO: deferred logger that logs token req.token.user_id user req.me.id
export default function logger(req, res, next) {
  // eslint-disable-next-line no-console
  console.log(
    `[${req.logId}] [API] ${req.method} ${req.originalUrl}`,
    // req.headers.cookie,
    req.query,
    req.body
  )
  next()
}
