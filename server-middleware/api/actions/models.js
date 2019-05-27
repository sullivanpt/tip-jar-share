import { resStatus, resJson } from '../connect-helpers'
import { defaultFormulas } from '../../../helpers/formulas'

// placeholder for persistent storage
export const models = {
  users: [],
  formulas: [],
  organizations: [],
  reports: []
}

function doReset() {
  models.users = []
  models.formulas = defaultFormulas()
  models.organizations = []
  models.reports = []
}

export function modelsReset(req, res, next) {
  if (req.body.secret !== 'cow-tipping-over') return resStatus(res, 403)
  doReset()
  resStatus(res, 204)
}

export function modelsDump(req, res, next) {
  if (req.query.secret !== 'cow-tipping') return resStatus(res, 403)
  resJson(res, models)
}
