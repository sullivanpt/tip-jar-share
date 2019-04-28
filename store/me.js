const defaultState = {
  id: null, // user ID, or null if not logged in
  organizationSelected: null, // currently selected organization or null if none
  // avatar must be buildGravatarUrl(gravatar)
  gravatar: null,
  avatar: null
}

export const state = () => defaultState

export const mutations = {
  /**
   * called after login (usually from 'enroll') to create the new user
   * or reload an existing users setting
   */
  enroll(state, { name }) {
    const id = name ? name.length : 1 // TODO: load from API based on token
    Object.assign(state, defaultState, {
      id
      // TODO: ... organizationSelected etc from API
    })
  },
  /**
   * called after logout to clear any user related state
   */
  expel(state) {
    Object.assign(state, defaultState)
  },
  organizationSelected(state, { organizationId }) {
    state.organizationSelected = organizationId
  },
  update(state, { gravatar, avatar }) {
    Object.assign(state, { gravatar, avatar })
  }
}
