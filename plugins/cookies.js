// Modified from https://github.com/nuxt/nuxt.js/blob/dev/examples/with-cookies/plugins/cookies.js
// These are client side and server side mutated cookies
import Cookie from 'cookie'
import JSCookie from 'js-cookie'
import { isString, isUnset } from '~/helpers/nodash'
import { logger } from '~/helpers/logger'

const log = logger('Cookies')

function parseCookies(str) {
  return Cookie.parse(str || '')
}

/**
 * Send Set-Cookie header from server side
 * from https://github.com/nuxt-community/auth-module/lib/core/storage.js
 *
 * TODO: currently assumes each key is set no more than once per server side request
 */
function setCookieHeader(res, key, value, options) {
  const _options = Object.assign({ path: '/' }, options)
  const _value =
    isUnset(value) || isString(value) ? value : JSON.stringify(value)
  if (isUnset(_value)) _options.maxAge = -1 // Unset null, undefined
  const serializedCookie = Cookie.serialize(key, _value, _options)
  const prev = res.getHeader('Set-Cookie')
  let headerValue = [serializedCookie]
  if (prev) {
    headerValue = Array.isArray(prev)
      ? prev.concat(serializedCookie)
      : [prev, serializedCookie]
  }
  res.setHeader('Set-Cookie', headerValue)
  return headerValue
}

/**
 * helpers for cookie access
 */
export default (ctx, inject) => {
  const cookies = {
    get(key) {
      return parseCookies(
        process.server ? ctx.req.headers.cookie : document.cookie
      )[key]
    },
    /**
     * will set the cookie with name (key) as either string value
     * or will JSON.stringify if value is an object
     */
    set(key, value, options = {}) {
      if (process.client) JSCookie.set(key, value, options)
      else if (process.server && ctx.res) {
        log(ctx, 'setCookieHeader set', key, value)
        setCookieHeader(ctx.res, key, value, options)
      }
    },
    remove(key) {
      if (process.client) JSCookie.remove(key)
      else if (process.server && ctx.res) {
        log(ctx, 'setCookieHeader remove', key)
        setCookieHeader(ctx.res, key)
      }
    },
    getJSON(key) {
      try {
        return JSON.parse(cookies.get(key))
      } catch (e) {
        return null
      }
    },
    /**
     * helper to appropriately update (set or remove) the persisted cookie when the vuex state changes
     * if defaultState is not provided then assumes null value is default for each key
     */
    persist(key, state, defaultState) {
      const saved = Object.keys(state).reduce((acc, key) => {
        if (defaultState) {
          if (state[key] !== defaultState[key]) acc[key] = state[key]
        } else if (!isUnset(state[key])) acc[key] = state[key]
        return acc
      }, {})
      if (Object.keys(saved).length) cookies.set(key, saved)
      else cookies.remove(key) // remove cookie if all defaults set
    }
  }

  // Inject `cookies` key
  // -> app.$cookies
  // -> this.$cookies in vue components
  // -> this.$cookies in store actions/mutations
  inject('cookies', cookies)
}
