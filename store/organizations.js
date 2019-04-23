export const state = () => ({
  organizationSelected: null,
  organizations: []
})

export const getters = {
  organizationOptions(state) {
    return state.organizations.map(org => ({
      text: org.name,
      value: org.id,
      avatar: org.avatar
    }))
  }
}

export const mutations = {
  select(state, { organizationId }) {
    state.organizationSelected = organizationId
  },
  join(state /* , { organizationTeamCode } */) {
    if (state.organizations.length === 0) {
      state.organizations.push({
        name: 'org 1',
        id: 'orgId1',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg'
      })
      state.organizationSelected = 'orgId1'
    }
  },
  create(state, { name, avatar }) {
    const id = (state.organizations.length + 1).toString()
    state.organizations.push({ id, name, avatar })
    state.organizationSelected = id
  }
}
