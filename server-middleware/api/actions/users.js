import uuidV4 from 'uuid/v4'
import { resJson } from '../connect-helpers'
import { pick } from '../../../helpers/nodash'
import { emailHash, emailMask } from '../../../helpers/masks'
import { buildGravatarUrl } from '../../../helpers/gravatar'
import { models } from './models'

/**
 * return only the public facing fields in a user
 */
export function userPublic(user) {
  return pick(user, ['id', 'name', 'avatar'])
}

/**
 * return private facing fields annotated with some token data
 */
export function userPrivate(me, req) {
  return Object.assign(
    {
      logId: req.logId, // for tying SSR to API
      expiresIn: req.token.expires_in // for warning near expiration
    },
    me
  )
}

/**
 * route handler to return the logged in user
 * create it if it didn't exist already
 */
export function meEnroll(req, res, next) {
  let user = models.users.find(
    user => !user.deleted && user.tjsSub === req.token.tjsSub
  )
  if (!user) {
    user = {
      // deleted: false, // API side only, fast delete and recovery. should be a timestamp
      id: uuidV4(), // our ID
      sub: req.token.user_id, // google's ID
      tjsSub: req.token.tjsSub, // google's ID
      name: req.body.name, // TODO: get this from our req.token
      emailMasked: emailMask(req.token.email), // user email recognizable
      emailHash: emailHash(req.token.email), // user email hash matcher
      gravatarMasked: null, // gravatar email recognizable
      avatar: null, // must be buildGravatarUrl(gravatar)
      selectedOrganizationId: null // ID of selected organization
    }
    models.users.push(user)
  }
  req.me = user // for logger
  resJson(res, userPrivate(user, req))
}

/**
 * route handler to remove all preferences from the user
 * and reset to initial enrolled state
 */
export function meReset(req, res, next) {
  if (req.method !== 'POST') return next() // will 404
  const user = models.users.find(
    user => !user.deleted && user.tjsSub === req.token.tjsSub
  )
  if (!user) return meEnroll(req, res, next)
  Object.assign(user, {
    // do nor reset the gravatar
    // gravatarMasked: null,
    // avatar: null,
    selectedOrganizationId: null
  })
  if (req.body.name) user.name = req.body.name
  else if (!user.name) user.name = user.id
  req.me = user // for logger
  resJson(res, userPrivate(user, req))
}

/**
 * route handler for partial update of logged in user
 */
export function meUpdate(req, res, next) {
  if (req.method !== 'POST') return next() // will 404
  const user = models.users.find(
    user => !user.deleted && user.tjsSub === req.token.tjsSub
  )
  if (!user) return next() // will 404
  const { gravatar, name, selectedOrganizationId } = req.body
  if (gravatar !== undefined && gravatar !== user.gravatarMasked) {
    // we don't allow API to accept avatarURLs, must build from scratch
    const avatar = (gravatar && buildGravatarUrl(gravatar)) || null
    const gravatarMasked = avatar ? emailMask(gravatar) : null
    user.avatar = avatar
    user.gravatarMasked = gravatarMasked
  }
  if (name) user.name = name // don't allow falsey values
  if (selectedOrganizationId !== undefined)
    user.selectedOrganizationId = selectedOrganizationId
  req.me = user // for logger
  resJson(res, userPrivate(user, req)) // FUTURE: just return what changed?
}

/**
 * middleware to enforce authenticate (req.token.tjsSub) user exists
 * attach that user as req.me
 */
export function validateMe(req, res, next) {
  const user = models.users.find(
    user => !user.deleted && user.tjsSub === req.token.tjsSub
  )
  if (!user) return next(new Error('me not enrolled'))
  req.me = user
  next()
}
