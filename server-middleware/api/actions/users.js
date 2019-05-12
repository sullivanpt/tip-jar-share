import uuidV4 from 'uuid/v4'
import { resJson } from '../connect-helpers'
import { emailHash, emailMask } from '../../../helpers/masks'
import { buildGravatarUrl } from '../../../helpers/gravatar'
import { models } from './models'

/**
 * route handler to return the logged in user
 * create it if it didn't exist already
 */
export function meEnroll(req, res, next) {
  let user = models.users.find(user => user.sub === req.user.user_id)
  if (!user) {
    user = {
      deleted: false, // API side only, fast delete and recovery
      id: uuidV4(), // our ID
      sub: req.user.user_id, // google's ID
      name: req.body.name, // TODO: get this from our req.user
      emailMasked: emailMask(req.user.email), // user email recognizable
      emailHash: emailHash(req.user.email), // user email hash matcher
      gravatarMasked: null, // gravatar email recognizable
      avatar: null, // must be buildGravatarUrl(gravatar)
      selectedOrganizationId: null // ID of selected organization
    }
    models.users.push(user)
  }
  resJson(res, user)
}

/**
 * route handler to remove all preferences from the user
 * and reset to initial enrolled state
 */
export function meReset(req, res, next) {
  if (req.method !== 'POST') return next() // will 404
  const user = models.users.find(user => user.sub === req.user.user_id)
  if (!user) return meEnroll(req, res, next)
  Object.assign(user, {
    deleted: false,
    gravatarMasked: null,
    avatar: null,
    selectedOrganizationId: null
  })
  if (req.body.name) user.name = req.body.name
  else if (!user.name) user.name = user.id
  resJson(res, user)
}

/**
 * route handler for partial update of logged in user
 */
export function meUpdate(req, res, next) {
  const user = models.users.find(user => user.sub === req.user.user_id)
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
  resJson(res, user) // TODO: just return what changed?
}
