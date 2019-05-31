import { resStatus, resJson } from '../connect-helpers'
import { defaultFormulas } from '../../../helpers/formulas'
import { modelsInitialize } from '../connectors/index'

/**
 * global causes only model API to respond when false
 * gives us a way to take API off line
 */
let apiOnline

// placeholder for persistent storage
export const models = {
  users: [],
  formulas: defaultFormulas(),
  organizations: [],
  reports: []
}

function doReset(force) {
  models.users = []
  models.formulas = defaultFormulas()
  models.organizations = []
  models.reports = []

  apiOnline = false
  return modelsInitialize(force).then(() => {
    // TODO: install default formulas here
    apiOnline = true
  })
}

export function modelsReset(req, res, next) {
  if (req.body.secret !== 'cow-tipping-over') return resStatus(res, 403)
  doReset(true)
  resStatus(res, 204)
}

export function modelsDump(req, res, next) {
  if (req.query.secret !== 'cow-tipping') return resStatus(res, 403)
  resJson(res, models)
}

export function validateModelsOnline(req, res, next) {
  if (!apiOnline) return resStatus(res, 503)
  next()
}

/**
 * at startup always populate the database if it doesn't exist
 */
doReset()
