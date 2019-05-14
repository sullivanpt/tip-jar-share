/**
 * represents tip sharing formula absent of any personal data
 */
export const state = () => ({
  rules: []
})

export const mutations = {
  /**
   * clear any data
   */
  expel(state) {
    state.rules = []
  }
  // TODO: lot of everything here
}
