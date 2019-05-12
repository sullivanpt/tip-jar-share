/**
 * fill or clear store.me based on auth object
 * See https://github.com/nuxt-community/auth-module
 */
export default async function({ app, store }) {
  app.$auth.onError((error, name, endpoint) => {
    console.error('$auth.onError', name, error, endpoint) // eslint-disable-line no-console
  })

  const loggedIn = app.$auth.loggedIn
  const sub = app.$auth.user && app.$auth.user.sub
  const name = app.$auth.user ? app.$auth.user.name : ''
  // eslint-disable-next-line no-console
  console.log('loggedIn', loggedIn, 'sub', sub, 'name', name)
  const previousSub = store.state.me.sub

  if (loggedIn) {
    if (sub !== previousSub) await store.dispatch('me/enroll', { name, sub })
  } else if (previousSub) store.dispatch('reset')
}
