export const state = () => ({
  loadingCounter: 0,
  oops: false // global error snackbar
})

export const mutations = {
  loadingIncrement(state) {
    state.loadingCounter++
  },
  loadingDecrement(state) {
    if (state.loadingCounter) state.loadingCounter--
  },
  oops(state, e) {
    state.oops = !!e
    if (e && e !== true) {
      console.log('vuex oops', e) // eslint-disable-line no-console
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
   * called when we detect user has logged out but data not been flushed
   */
  expel({ commit }) {
    // TODO: uncomment these expel when API hooked up
    // commit('reports/expel')
    // commit('organizations/expel')
    // commit('users/expel')
    // commit('formulas/expel')
    commit('me/expel')
  },
  /**
   * called after login (usually from 'enroll') to create the new user
   * or reload an existing users setting
   */
  async enroll({ commit, dispatch }, data) {
    try {
      await dispatch('me/enroll', data)
      // TODO: load lists of organizations, active organization, lists of reports, etc.
    } catch (e) {
      commit('oops', e, { root: true })
    }
  }
}
