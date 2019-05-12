import connect from 'connect'
import bodyParser from 'body-parser'
import errorHandler from './error-handler'
import logger from './logger'
import { validateQueryAndBody } from './validators'
import authenticate from './authenticate'
import { query, resStatus } from './connect-helpers'
import { modelsDump, modelsReset } from './actions/models'
import { meEnroll, meReset, meUpdate } from './actions/users'

const app = connect()
app.use(bodyParser.json({ type: () => true }))
app.use(query)
app.use(logger)
app.use(validateQueryAndBody)

// non-authenticated API resource handlers
app.use('/models/dump', modelsDump)
app.use('/models/reset', modelsReset)

app.use(authenticate)

// API resource handlers
app.use('/me/enroll', meEnroll)
app.use('/me/reset', meReset)
app.use('/me/update', meUpdate)

// All other API routes return a 404 to prevent infinite recursion with Nuxt UI and to make debugging easier
app.use((req, res) => resStatus(res, 404))

// Simplify debugging by logging developer errors
app.use(errorHandler)

export default app
