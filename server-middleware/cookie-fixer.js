/**
 * ensure set-cookie server side is always an array
 * work-around for https://github.com/nuxt-community/auth-module/pull/367
 * see http://www.connecto.io/blog/nodejs-express-how-to-set-multiple-cookies-in-the-same-response-object/
 * inspired by https://github.com/nuxt/nuxt.js/pull/4755#issuecomment-456459334
 */
export default function attachHeaderListener(req, res, next) {
  const sh = res.setHeader
  res.setHeader = (key, value) => {
    if (key.toLowerCase() === 'set-cookie') {
      if (!Array.isArray(value)) value = [value]
    }
    sh.call(res, key, value)
  }
  next()
}
