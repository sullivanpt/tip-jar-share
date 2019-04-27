export const state = () => ({
  loadingCounter: 0,
  counter: 0
})

export const mutations = {
  loadingIncrement(state) {
    state.loadingCounter++
  },
  loadingDecrement(state) {
    if (state.loadingCounter) state.loadingCounter--
  },
  increment(state) {
    state.counter++
  }
}

export const getters = {
  loading(state) {
    // TODO: find this.$auth.busy, it isn't in rootState.auth
    return state.loadingCounter > 0
  }
}
