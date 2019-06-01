import cookie from 'cookie'
import { resStatus } from './connect-helpers'
import { verifyGoogleAccessToken } from './auth-google'

/**
 * enforce valid access_token
 * attach decoded token as req.token
 *
 * TODO: cache <token, user> pairs locally for some short period
 */
export default function authenticate(req, res, next) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const strategy = cookies['auth.strategy']
  if (strategy !== 'google') return next(new Error('invalid strategy'))
  const token = (cookies['auth._token.google'] || '').split(' ')[1]
  if (!token) return next(new Error('token required'))
  verifyGoogleAccessToken(token)
    .then(verified => {
      req.token = verified
      req.token.tjsSub = `google:${verified.user_id}` // provider:<provider user ID>
      next()
    })
    .catch(err => {
      console.log(`[${req.logId}] ${err.toString()}`) // eslint-disable-line no-console
      resStatus(res, 401)
    })
}
