import { logger } from '~/helpers/logger'
import { isBrowserHidden } from '~/helpers/browser'

const log = logger('Expire')

/**
 * polls me expiration timer once each 10 seconds
 * when timer is expired force a logout
 * assumes user is logged in
 * maintains a timer resource so do not run on server side
 * TODO: need to be able to disable this for unit testing
 */
function startExpiredInterval({ app, store }) {
  setInterval(function intervalElapsed() {
    if (isBrowserHidden()) return // do nothing when hidden
    if (store.state.expired) {
      store.commit('expired') // prevent loop
      log({ store }, 'reloading expired session')
      // TODO: the $auth me.js is not called on logout, not sure why
      store.commit('me/expel')
      app.$auth.logout()
    }
  }, 10000)
}

/**
 * polls refresh timer once each 60 seconds
 * maintains a timer resource so do not run on server side
 * TODO: need to be able to disable this for unit testing
 */
function startRefreshInterval({ app, store }) {
  setInterval(function intervalElapsed() {
    if (isBrowserHidden()) return // do nothing when hidden
    const loggedIn = app.$auth.loggedIn
    if (!loggedIn) return // skip API if we used to be logged in but are not now
    store.dispatch('refreshAuto')
  }, 60000)
}

/**
 * this nuxt middleware starts the interval timer only on the client
 * TODO: might check if there is a standard way to do this
 */
export default function expire({ app, store }) {
  if (!process.server) {
    const loggedIn = app.$auth.loggedIn
    if (!loggedIn) return // skip timers if we're not logged in
    startExpiredInterval({ app, store })
    startRefreshInterval({ app, store })
  }
}
