import { isString } from '~/helpers/nodash'

/**
 * middleware to capture query organizationMemberCode '?code='
 * store it in a cookie so it persists across OAuth login
 * and persist it in the store
 */
export default function queryCookieStore({ route, store }) {
  if (process.server) {
    const { code } = route.query
    if (isString(code) && /^\w{3}-\w{3}$/.test(code)) {
      store.commit('cookie/code', { code })
    }
  }
}
