/**
 * cookie backed store
 */

/**
 * name of the cookie backing this store
 */
const COOKIE = 'tjs-store'

/**
 * default state. used to initialize the state and
 * to decide when the cookie needs to be set or cleared
 */
export const state = () => ({
  code: null
})

export const mutations = {
  /**
   * recreate the state from persisted data
   * server and client side use cookie with shared state
   */
  hydrate(state) {
    const payload = this.$cookies.getJSON(COOKIE)
    if (payload) Object.assign(state, payload)
  },
  code(_state, { code }) {
    _state.code = code
    this.$cookies.persist(COOKIE, _state, state())
  }
}
