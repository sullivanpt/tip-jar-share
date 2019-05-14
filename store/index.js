export const state = () => ({
  loadingCounter: 0
})

export const mutations = {
  loadingIncrement(state) {
    state.loadingCounter++
  },
  loadingDecrement(state) {
    if (state.loadingCounter) state.loadingCounter--
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
  reset({ commit }) {
    commit('reports/expel')
    commit('organizations/expel')
    commit('users/expel')
    commit('rules/expel')
    commit('me/expel')
  },
  /**
   * called after login (usually from 'enroll') to create the new user
   * or reload an existing users setting
   */
  async enroll({ dispatch }, data) {
    await dispatch('me/enroll', data)
    // TODO: load lists of organizations, active organization, lists of reports, etc.
  }
}
