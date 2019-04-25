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
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        positions: [
          { id: 1, name: 'host', rule: 'beneficciary' },
          { id: 2, name: 'waiter', rule: 'contributor' },
          { id: 3, name: 'bartender', rule: 'beneficciary' }
        ],
        members: [
          { id: 1, name: 'John Doe', code: 'XSEFG-ABCDR', position: 'host' },
          { id: 2, name: 'Jack Frat', linked: true, position: 'waiter' },
          {
            id: 3,
            name: 'Jennie Brown',
            linked: true,
            position: 'waiter',
            manager: true
          }
        ]
      })
      state.organizationSelected = 'orgId1'
    }
  },
  create(state, { name, avatar }) {
    const id = (state.organizations.length + 1).toString()
    state.organizations.push({ id, name, avatar, positions: [], members: [] })
    state.organizationSelected = id
  }
}
