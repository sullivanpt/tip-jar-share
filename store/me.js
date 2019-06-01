const defaultState = {
  id: null, // our ID
  sub: null, // google's ID
  logId: null, // API logId from last enroll
  expires: null, // timestamp when token expires (expiresIn sec + now)
  name: null, // TODO: get this from our req.user
  emailMasked: null, // user email recognizable
  emailHash: null, // user email hash matcher
  gravatarMasked: null, // gravatar email recognizable
  avatar: null, // must be buildGravatarUrl(gravatar)
  selectedOrganizationId: null // user's selected organization or null
}

export const state = () => Object.assign({}, defaultState)

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
    if (dbUser.expiresIn)
      state.expires = parseInt(dbUser.expiresIn) * 1000 + Date.now()
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
    // try/catch oops in parent
    const dbUser = await this.$api.meEnroll(data)
    commit('enroll', dbUser)
  },
  /**
   * reset user to default state
   */
  async reset({ commit }, data) {
    // try/catch oops in parent
    const dbUser = await this.$api.meReset(data)
    commit('enroll', dbUser)
  },
  /**
   * update gravatar => (gravatarMasked, avatar) and name
   */
  async update({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const dbUser = await this.$api.meUpdate(data)
      commit('update', dbUser)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  /**
   * set selected organization or null for none
   * immediately update local state, then lazy dispatch API update
   */
  selectedOrganizationId({ commit }, { organizationId }) {
    try {
      // commit('loadingIncrement', null, { root: true }) -- no loading counter here
      commit('selectedOrganizationId', { organizationId })
      return this.$api.meUpdate({ selectedOrganizationId: organizationId })
    } catch (e) {
      commit('oops', e, { root: true })
    }
  }
}
