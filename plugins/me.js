import { logger } from '~/helpers/logger'

const log = logger('Me')

/**
 * fill or clear store.me based on auth object
 * See https://github.com/nuxt-community/auth-module
 */
export default async function({ app, req, store }) {
  app.$auth.onError((error, name, endpoint) => {
    console.error('$auth.onError', name, error, endpoint) // eslint-disable-line no-console
  })

  const loggedIn = app.$auth.loggedIn
  const sub = app.$auth.user && app.$auth.user.sub
  const name = app.$auth.user ? app.$auth.user.name : ''
  const previousSub = store.state.me.sub

  if (loggedIn) {
    if (sub !== previousSub) await store.dispatch('enroll', { name, sub })
  } else if (previousSub) await store.dispatch('expel')

  const meId = store.state.me.id
  log(
    { req, store },
    `${loggedIn ? 'auth' : 'guest'} sub ${sub} me ${meId} (prev ${previousSub})`
  )
}
