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
 * async/await route fn wrapper
 * From https://github.com/Greenfields/express-async-wrap/blob/master/src/index.js
 */
export function middlewareAsync(fn) {
  if (fn.length <= 3) {
    return function(req, res, next) {
      return fn(req, res, next).catch(next)
    }
  } else {
    return function(err, req, res, next) {
      return fn(err, req, res, next).catch(next)
    }
  }
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
