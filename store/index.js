import { isObject, objectHash } from '~/helpers/nodash'

export const state = () => ({
  loadingCounter: 0,
  expired: false, // set true on status 401 to indicate log out needed
  oops: false, // global error snackbar
  oopsMessage: null
})

export const mutations = {
  reset(state) {
    state.loadingCounter = 0
    state.expired = false
    state.oops = false
    state.oopsMessage = null
  },
  loadingIncrement(state) {
    state.loadingCounter++
  },
  loadingDecrement(state) {
    if (state.loadingCounter) state.loadingCounter--
  },
  expired(state) {
    state.expired = false
  },
  oops(state, e) {
    state.oops = !!e
    state.oopsMessage = null
    if (e && e !== true) {
      console.log('vuex oops', e) // eslint-disable-line no-console
      if (isObject(e.response)) {
        // isAxiosError
        if (e.response.status === 400)
          state.oopsMessage = 'make corrections then try again'
        if (e.response.status === 401) {
          state.oopsMessage = 'session expired'
          state.expired = true // force a logout by expire plugin
        }
        if (e.response.status === 403) state.oopsMessage = 'not allowed'
        if (e.response.status === 429)
          state.oopsMessage = 'try again in 5 seconds'
        if (e.response.status === 503)
          state.oopsMessage = 'try again in 10 minutes'
      } else if (isObject(e.config))
        state.oopsMessage = 'cannot connect to server'
    }
  }
}

export const getters = {
  loading(state) {
    // TODO: find this.$auth.busy, it isn't in rootState.auth
    return state.loadingCounter > 0
  }
}

export const actions = {
  /**
   * ensures cookie state deserialized
   * see https://nuxtjs.org/guide/vuex-store#the-nuxtserverinit-action
   */
  nuxtServerInit({ commit }) {
    commit('cookie/hydrate')
  },
  /**
   * called after hydration client side to recover from any SSR API errors
   */
  oopsRefresh({ state }) {
    if (state.oops) {
      console.log(`SSR oopsRefresh ${state.oopsMessage}`) // eslint-disable-line no-console
      // TODO: dispatch('refresh')
    }
  },
  /**
   * add or update many stores
   */
  add({ commit }, all) {
    if (all.users) commit('users/add', all.users)
    if (all.formulas) commit('formulas/add', all.formulas)
    if (all.organizations) commit('organizations/add', all.organizations)
    if (all.reports) commit('reports/add', all.reports)
  },
  /**
   * automatically refresh by polling API, but only when 'safe' to do so
   * keep load low. do not interfere with editing
   */
  async refreshAuto({ commit }) {
    try {
      commit('loadingIncrement')
      await this.$api.meValidate() // TODO: actually refresh some data, like audits
    } catch (e) {
      commit('oops', e)
    } finally {
      commit('loadingDecrement')
    }
  },
  /**
   * called after deleting organization membership
   */
  async refresh({ commit }, scope) {
    const data = {}
    if (scope.hint) data.hint = scope.hint
    const hashable = ['formulas', 'organizations', 'reports']
    hashable.forEach(hkey => {
      const isFlatShortStringsKeys = 40
      if (scope[hkey] && scope[hkey].length < isFlatShortStringsKeys)
        data[hkey] = scope[hkey].reduce((acc, rpt) => {
          acc[rpt.id] = objectHash(rpt)
          return acc
        }, {})
    })
    try {
      commit('loadingIncrement')
      const all = await this.$api.allRefresh(data)
      commit('reports/expel')
      commit('organizations/expel')
      commit('formulas/expel')
      commit('users/expel')
      commit('users/add', all.users)
      commit('formulas/refresh', all.formulas)
      commit('organizations/refresh', all.organizations)
      commit('reports/refresh', all.reports)
    } catch (e) {
      commit('oops', e)
      throw e
    } finally {
      commit('loadingDecrement')
    }
  },
  /**
   * called to reset as close as possible to base state without logging out
   */
  async reset({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement')
      await dispatch('me/reset', data)
      commit('reset')
      dispatch('refresh')
    } catch (e) {
      commit('oops', e)
    } finally {
      commit('loadingDecrement')
    }
  },
  /**
   * called when we detect user has logged out but data not been flushed
   */
  expel({ commit }) {
    commit('reports/expel')
    commit('organizations/expel')
    commit('formulas/expel')
    commit('users/expel')
    commit('me/expel')
    commit('expired')
  },
  /**
   * called after login (usually from 'enroll') to create the new user
   * or reload an existing users setting
   */
  async enroll({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement')
      await dispatch('me/enroll', data)
      // load lists of organizations, active organization, lists of reports, etc.
      const all = await this.$api.allRefresh()
      commit('users/add', all.users)
      commit('formulas/refresh', all.formulas)
      commit('organizations/refresh', all.organizations)
      commit('reports/refresh', all.reports)
    } catch (e) {
      commit('oops', e)
    } finally {
      commit('loadingDecrement')
    }
  }
}
