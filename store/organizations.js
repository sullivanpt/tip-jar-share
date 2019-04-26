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
      // note: stubbed meId is 1 so NOT a manager of this team
      state.organizations.push({
        name: 'org 1',
        id: 'orgId1',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        positions: [
          { id: 1, name: 'host', rule: 'beneficiary' },
          { id: 2, name: 'waiter', rule: 'contributor' },
          { id: 3, name: 'bartender', rule: 'beneficiary' }
        ],
        members: [
          { id: 1, name: 'John Doe', code: 'XSEFG-ABCDR', position: 'host' },
          { id: 2, name: 'Jack Frat', linkedId: 2, position: 'waiter' },
          {
            id: 3,
            name: 'Jennie Brown',
            linkedId: 3,
            position: 'waiter',
            manager: true
          }
        ]
      })
      state.organizationSelected = 'orgId1'
    }
  },
  create(state, { managerName, managerId, name, avatar }) {
    const id = (state.organizations.length + 1).toString()
    state.organizations.push({
      id,
      name,
      avatar,
      positions: [],
      members: [
        // creator is always the first manager
        {
          id: 1,
          position: 'manager',
          manager: true,
          name: managerName,
          linkedId: managerId
        }
      ]
    })
    state.organizationSelected = id
  },
  update(state, { id, name, avatar }) {
    const organization = state.organizations.find(org => id === org.id)
    if (!organization) return
    Object.assign(organization, { name, avatar })
  }
}
