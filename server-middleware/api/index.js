import connect from 'connect'
import bodyParser from 'body-parser'
import errorHandler from './error-handler'
import logger from './logger'
import rateLimiter from './rate-limiter'
import { validateQueryAndBody } from './validators'
import authenticate from './authenticate'
import { middlewareAsync, query, resStatus } from './connect-helpers'
import { modelsDump, modelsReset, validateModelsOnline } from './actions/models'
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
app.use('/models/dump', modelsDump)
app.use('/models/reset', rateLimiter) // harder to brute force models
app.use('/models/reset', modelsReset)

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

app.use('/all/refresh', allRefresh)

// all routes beyond here are post only
app.use((req, res, next) => {
  if (req.method !== 'POST') return resStatus(res, 404)
  next()
})

app.use('/organizations/join', rateLimiter) // harder to brute force join
app.use('/organizations/join', organizationJoin)

app.use('/formulas/allocations/create', formulaAllocationCreate)
app.use('/formulas/allocations/update', formulaAllocationUpdate)
app.use('/formulas/allocations/delete', formulaAllocationDelete)
app.use('/organizations/create', organizationCreate)
app.use('/organizations/update', organizationUpdate)
app.use('/organizations/delete', organizationDelete)
app.use('/organizations/stations/create', organizationStationCreate)
app.use('/organizations/stations/update', organizationStationUpdate)
app.use('/organizations/stations/delete', organizationStationDelete)
app.use('/organizations/members/create', organizationMemberCreate)
app.use('/organizations/members/update', organizationMemberUpdate)
app.use('/reports/create', reportCreate)
app.use('/reports/update', reportUpdate)
app.use('/reports/delete', reportDelete)
app.use('/reports/collections/update', reportCollectionUpdate)
app.use('/reports/reporters/update', reportReporterUpdate)

// All other API routes return a 404 to prevent infinite recursion with Nuxt UI and to make debugging easier
app.use((req, res) => resStatus(res, 404))

// Simplify debugging by logging developer errors
app.use(errorHandler)

export default app
