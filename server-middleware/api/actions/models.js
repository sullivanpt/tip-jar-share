import { resStatus, resJson } from '../connect-helpers'

// placeholder for persistent storage
export const models = {
  users: []
}

export function modelsReset(req, res, next) {
  if (req.body.secret !== 'cow-tipping-over') return resStatus(res, 403)
  models.users = []
  resStatus(res, 204)
}

export function modelsDump(req, res, next) {
  if (req.query.secret !== 'cow-tipping') return resStatus(res, 403)
  resJson(res, models)
}
