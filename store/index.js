import { isObject } from '~/helpers/nodash'

export const state = () => ({
  loadingCounter: 0,
  oops: false, // global error snackbar
  oopsMessage: null
})

export const mutations = {
  reset(state) {
    state.loadingCounter = 0
    state.oops = false
    state.oopsMessage = null
  },
  loadingIncrement(state) {
    state.loadingCounter++
  },
  loadingDecrement(state) {
    if (state.loadingCounter) state.loadingCounter--
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
        if (e.response.status === 401) state.oopsMessage = 'session expired'
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
   * add or update many stores
   */
  add({ commit }, all) {
    if (all.users) commit('users/add', all.users)
    if (all.formulas) commit('formulas/add', all.formulas)
    if (all.organizations) commit('organizations/add', all.organizations)
    if (all.reports) commit('reports/add', all.reports)
  },
  /**
   * called after deleting organization membership
   */
  async refresh({ commit }) {
    try {
      commit('loadingIncrement')
      const all = await this.$api.allRefresh()
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
