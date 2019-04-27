export const state = () => ({
  organizationSelected: null,
  organizations: []
})

export const getters = {
  // TODO: maybe our API should not return members[].code unless user is a manager?
  organizationOptions(state) {
    return state.organizations.map(org => ({
      text: org.name,
      value: org.id,
      avatar: org.avatar
    }))
  }
}

const defaultPositions = [
  { id: 1, name: 'host', rule: 'beneficiary' },
  { id: 2, name: 'waiter', rule: 'contributor' },
  { id: 3, name: 'bartender', rule: 'beneficiary' }
]

export const mutations = {
  select(state, { organizationId }) {
    state.organizationSelected = organizationId
  },
  join(state, { meId }) {
    // TODO: organizationTeamCode
    // TODO: enforce can only join each time once
    // TODO: keep history of linked/unlinked users to position
    if (state.organizations.length === 0) {
      // note: stubbed meId is 1 is a manager of this team
      state.organizations.push({
        name: 'Club Pluto',
        id: 'orgId1',
        // TODO: maybe don't save gravatar email or encrypt it
        // example from https://stackoverflow.com/a/54004588
        gravatar: 'jitewaboh@lagify.com',
        avatar:
          'https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b',
        positions: defaultPositions,
        members: [
          { id: 1, name: 'John Doe', code: 'XSEFG-ABCDR', position: 'host' },
          {
            id: 2,
            name: 'Jack Frat',
            linkedId: meId,
            position: 'waiter',
            manager: true
          },
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
  create(state, { managerName, managerId, name, gravatar, avatar }) {
    const id = (state.organizations.length + 1).toString()
    state.organizations.push({
      id,
      name,
      gravatar,
      avatar,
      positions: defaultPositions,
      members: [
        // creator is always the first manager
        {
          id: 1,
          position: 'bartender',
          manager: true,
          name: managerName,
          linkedId: managerId
        }
      ]
    })
    state.organizationSelected = id
  },
  update(state, { id, ...attrs }) {
    const organization = state.organizations.find(org => id === org.id)
    if (!organization) return
    Object.assign(organization, attrs)
  },
  delete(state, { id }) {
    state.organizations = state.organizations.filter(org => id !== org.id)
  },
  positionCreate(state, { organizationId, name, rule }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const id = (organization.positions.length + 1).toString()
    organization.positions.push({
      id,
      name,
      rule
    })
  },
  positionUpdate(state, { organizationId, id, ...attrs }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const position = organization.positions.find(pos => id === pos.id)
    if (!position) return
    Object.assign(position, attrs)
  },
  memberCreate(state, { organizationId, name, position, code, manager }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const id = (organization.members.length + 1).toString()
    organization.members.push({
      id,
      name,
      position,
      code,
      manager
    })
  },
  memberUpdate(state, { organizationId, id, ...attrs }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const member = organization.members.find(mbr => id === mbr.id)
    if (!member) return
    Object.assign(member, attrs)
  }
}
