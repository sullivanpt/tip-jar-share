const defaultState = {
  id: null, // our ID
  sub: null, // google's ID
  name: null, // TODO: get this from our req.user
  emailMasked: null, // user email recognizable
  emailHash: null, // user email hash matcher
  gravatarMasked: null, // gravatar email recognizable
  avatar: null, // must be buildGravatarUrl(gravatar)
  selectedOrganizationId: null // user's selected organization or null
}

export const state = () => defaultState

export const mutations = {
  /**
   * called after login (usually from 'enroll') to create the new user
   * or reload an existing users setting
   */
  enroll(state, dbUser) {
    Object.keys(defaultState).forEach(key => {
      if (dbUser[key] !== undefined) state[key] = dbUser[key]
      else state[key] = defaultState[key]
    })
  },
  /**
   * called after logout to clear any user related state
   */
  expel(state) {
    Object.assign(state, defaultState)
  },
  selectedOrganizationId(state, { organizationId }) {
    state.selectedOrganizationId = organizationId
  },
  update(state, { gravatarMasked, avatar }) {
    Object.assign(state, { gravatarMasked, avatar })
  }
}

export const actions = {
  /**
   * load user from API which uses (google) access token
   */
  async enroll({ commit }, data) {
    const dbUser = await this.$api.meEnroll(data)
    commit('enroll', dbUser)
  },
  /**
   * reset user to default state
   */
  async reset({ commit }, data) {
    const dbUser = await this.$api.meReset(data)
    commit('enroll', dbUser)
  },
  /**
   * update gravatar => (gravatarMasked, avatar) and name
   */
  async update({ commit }, data) {
    const dbUser = await this.$api.meUpdate(data)
    commit('update', dbUser)
  },
  /**
   * set selected organization or null for none
   * immediately update local state, then lazy dispatch API update
   */
  selectedOrganizationId({ commit }, { organizationId }) {
    commit('selectedOrganizationId', { organizationId })
    return this.$api.meUpdate({ selectedOrganizationId: organizationId })
  }
}
