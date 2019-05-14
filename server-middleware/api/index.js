import connect from 'connect'
import bodyParser from 'body-parser'
import errorHandler from './error-handler'
import logger from './logger'
import { validateQueryAndBody } from './validators'
import authenticate from './authenticate'
import { query, resStatus } from './connect-helpers'
import { modelsDump, modelsReset } from './actions/models'
import { meEnroll, meReset, meUpdate, validateMe } from './actions/users'

const app = connect()
// attach req.body
app.use(bodyParser.json({ type: () => true }))
// attach req.query
app.use(query)
app.use(logger) // TODO: deferred logger that logs token sub and user id
app.use(validateQueryAndBody)

// non-authenticated API resource handlers
app.use('/models/dump', modelsDump)
app.use('/models/reset', modelsReset)

// enforce caller has valid 3rd party access token
// attach req.user
app.use(authenticate)

// API resource handlers
app.use('/me/enroll', meEnroll)
app.use('/me/reset', meReset)
app.use('/me/update', meUpdate)

// enforce caller for access token has been enrolled
// attach req.me
app.use(validateMe)

// All other API routes return a 404 to prevent infinite recursion with Nuxt UI and to make debugging easier
app.use((req, res) => resStatus(res, 404))

// Simplify debugging by logging developer errors
app.use(errorHandler)

export default app
