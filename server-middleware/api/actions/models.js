import { resJson, resStatus } from '../connect-helpers'
import { defaultFormulas } from '../../../helpers/formulas'
import * as connectors from '../connectors'

/**
 * global so we only connect and initialize the DB on first API request
 * 2 - initializing
 * 1 - not initialized
 * 0 - ready
 */
let modelsConnecting = 1

/**
 * global causes only model API to respond when false
 * gives us a way to take API off line
 */
let apiOnline

function doReset(force) {
  apiOnline = false
  return connectors
    .modelsInitialize(force)
    .then(() => connectors.formulas.findAllShared()) // FUTURE: just use COUNT here
    .then(formulas => {
      if (formulas.length) return
      return connectors.formulas.bulkCreate(defaultFormulas())
    })
    .then(() => {
      apiOnline = true
    })
}

export async function modelsReset(req, res, next) {
  if (req.body.secret !== 'cow-tipping-over') return resStatus(res, 403)
  await doReset(true)
  resStatus(res, 204)
}

export async function modelsDump(req, res, next) {
  if (req.query.secret !== 'cow-tipping') return resStatus(res, 403)
  const [
    formulas,
    organizations,
    reports,
    users,
    members,
    codes
  ] = await Promise.all([
    connectors.formulas.dump(),
    connectors.organizations.dump(),
    connectors.reports.dump(),
    connectors.users.dump(),
    connectors.organizations.dumpMembers(),
    connectors.organizations.dumpCodes()
  ])
  resJson(res, { formulas, organizations, reports, users, members, codes })
}

export async function modelsPurge(req, res, next) {
  if (req.body.secret !== 'cow-tipping-away') return resStatus(res, 403)
  await Promise.all([
    connectors.formulas.purge(),
    connectors.organizations.purge(),
    connectors.reports.purge(),
    connectors.users.purge()
  ])
  resStatus(res, 204)
}

export function validateModelsOnline(req, res, next) {
  if (!apiOnline) return resStatus(res, 503)
  next()
}

/**
 * at startup always populate the database if it doesn't exist
 */
export function connectModels(req, res, next) {
  if (!modelsConnecting) return next() // we are ready
  if (modelsConnecting !== 1) {
    console.log(`[${req.logId}] [API] connectModels duplicate`) // eslint-disable-line no-console
    return resStatus(res, 503) // another request got here first
  }
  modelsConnecting = 2 // only one request on this server instance should reach here
  console.log(`[${req.logId}] [API] connectModels entered`) // eslint-disable-line no-console
  connectors.db.loadModelsSync()
  console.log(`[${req.logId}] [API] connectModels loaded`) // eslint-disable-line no-console
  doReset()
    .catch(err => {
      console.log(`[${req.logId}] [API] connectModels error`, err) // eslint-disable-line no-console
    })
    .finally(() => {
      console.log(`[${req.logId}] [API] connectModels exited`) // eslint-disable-line no-console
      modelsConnecting = 0
      next()
    })
}
