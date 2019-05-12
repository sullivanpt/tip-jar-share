import url from 'url'

/**
 * connect helper for res.status(status).end()
 */
export function resStatus(res, status = 500) {
  res.statusCode = status
  res.end()
}

/**
 * connect helper for res.json(data)
 */
export function resJson(res, data) {
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify(data))
}

/**
 * middleware to attach req.query
 */
export function query(req, res, next) {
  if (req.query) return
  // eslint-disable-next-line node/no-deprecated-api
  req.query = url.parse(req.url, true).query // new URL(req.url).searchParams
  next()
}
