/**
 * fill or clear store.me based on auth object
 * See https://github.com/nuxt-community/auth-module
 */
export default function({ app, store }) {
  app.$auth.onError((error, name, endpoint) => {
    console.error('$auth.onError', name, error, endpoint) // eslint-disable-line no-console
  })

  const loggedIn = app.$auth.loggedIn
  const name = app.$auth.user ? app.$auth.user.name : ''
  console.log('loggedIn', loggedIn, 'name', name) // eslint-disable-line no-console

  if (loggedIn) store.commit('me/enroll', { name })
  else store.commit('me/expel')
}
