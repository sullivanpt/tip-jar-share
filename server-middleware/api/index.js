import connect from 'connect'
import bodyParser from 'body-parser'
import errorHandler from './error-handler'
import logger from './logger'
import rateLimiter from './rate-limiter'
import { validateQueryAndBody } from './validators'
import authenticate from './authenticate'
import { middlewareAsync, query, resStatus } from './connect-helpers'
import {
  modelsDump,
  modelsPurge,
  modelsReset,
  validateModelsOnline
} from './actions/models'
import { meEnroll, meReset, meUpdate, validateMe } from './actions/users'
import { allRefresh } from './actions/all'
import {
  formulaAllocationCreate,
  formulaAllocationUpdate,
  formulaAllocationDelete
} from './actions/formulas-allocations'
import { organizationJoin } from './actions/organizations-join'
import {
  organizationCreate,
  organizationUpdate,
  organizationDelete
} from './actions/organizations'
import {
  organizationStationCreate,
  organizationStationUpdate,
  organizationStationDelete
} from './actions/organizations-stations'
import {
  organizationMemberCreate,
  organizationMemberUpdate
} from './actions/organizations-members'
import { reportCreate, reportUpdate, reportDelete } from './actions/reports'
import { reportCollectionUpdate } from './actions/reports-collections'
import { reportReporterUpdate } from './actions/reports-reporters'

const app = connect()
// attach req.body
app.use(bodyParser.json({ type: () => true }))
// attach req.query
app.use(query)
app.use(logger)
app.use(validateQueryAndBody)

// non-authenticated API resource handlers
app.use('/models/dump', rateLimiter) // harder to brute force models
app.use('/models/dump', middlewareAsync(modelsDump))
app.use('/models/purge', middlewareAsync(modelsPurge))
app.use('/models/reset', rateLimiter) // harder to brute force models
app.use('/models/reset', middlewareAsync(modelsReset))

// all routes beyond here can be taken off line
app.use(validateModelsOnline)

// enforce caller has valid 3rd party access token
// attach req.token
app.use(authenticate)

// API resource handlers
app.use('/me/enroll', middlewareAsync(meEnroll))
app.use('/me/reset', middlewareAsync(meReset))
app.use('/me/update', middlewareAsync(meUpdate))

// enforce caller for access token has been enrolled
// attach req.me
app.use(middlewareAsync(validateMe))

app.use('/all/refresh', middlewareAsync(allRefresh))

// all routes beyond here are post only
app.use((req, res, next) => {
  if (req.method !== 'POST') return resStatus(res, 404)
  next()
})

app.use('/organizations/join', rateLimiter) // harder to brute force join
app.use('/organizations/join', middlewareAsync(organizationJoin))

app.use(
  '/formulas/allocations/create',
  middlewareAsync(formulaAllocationCreate)
)
app.use(
  '/formulas/allocations/update',
  middlewareAsync(formulaAllocationUpdate)
)
app.use(
  '/formulas/allocations/delete',
  middlewareAsync(formulaAllocationDelete)
)
app.use('/organizations/create', middlewareAsync(organizationCreate))
app.use('/organizations/update', middlewareAsync(organizationUpdate))
app.use('/organizations/delete', middlewareAsync(organizationDelete))
app.use(
  '/organizations/stations/create',
  middlewareAsync(organizationStationCreate)
)
app.use(
  '/organizations/stations/update',
  middlewareAsync(organizationStationUpdate)
)
app.use(
  '/organizations/stations/delete',
  middlewareAsync(organizationStationDelete)
)
app.use(
  '/organizations/members/create',
  middlewareAsync(organizationMemberCreate)
)
app.use(
  '/organizations/members/update',
  middlewareAsync(organizationMemberUpdate)
)
app.use('/reports/create', middlewareAsync(reportCreate))
app.use('/reports/update', middlewareAsync(reportUpdate))
app.use('/reports/delete', middlewareAsync(reportDelete))
app.use('/reports/collections/update', middlewareAsync(reportCollectionUpdate))
app.use('/reports/reporters/update', middlewareAsync(reportReporterUpdate))

// All other API routes return a 404 to prevent infinite recursion with Nuxt UI and to make debugging easier
app.use((req, res) => resStatus(res, 404))

// Simplify debugging by logging developer errors
app.use(errorHandler)

export default app
