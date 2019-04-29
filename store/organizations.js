export const state = () => ({
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
  },
  // TODO: when dispatch is implemented thosecan return IDs of new items
  lastId(state) {
    return state.organizations.length && state.organizations.slice(-1)[0].id
  }
}

const defaultPositions = [
  // enters:
  // - hours worked
  // - total sales
  // - excluded sales
  // - claimed tips
  { id: 1, name: 'server', rule: 'in/out:server-pool in:bar-pool' },
  // enters (closing bartender enters on behalf of):
  // - hours worked
  { id: 2, name: 'bar back', rule: 'out:bar-pool' },
  // enters:
  // - hours worked
  // - total sales
  // - cc tips -- TODO: what does "CC" mean?
  // only closing bartender enters (entered once, not per member)
  // - bar's tip jar total
  { id: 3, name: 'bartender', rule: 'in/out:bar-pool' }
  // TODO: 'kitchen crew', 'food runner', 'busser', 'host'
]

const defaultTeamRule = {
  name: 'sales-weighted-group-pool',
  // TODO: use fixed point variables
  serverSalesPercenToBarTip: 1, // %, Servers to Bar Tip Rate % of Sales
  bartenderTipPercentToBarBackTip: 1 // %, Bar Tenders to Bar Back Tip Rate
}

export const mutations = {
  join(state, { meId }) {
    if (!meId) throw new Error('organizations/join meId invalid')
    // TODO: organizationTeamCode
    // TODO: enforce rate limiter on join; maybe global 1 attempt per second
    // TODO: enforce can only join each time once
    // TODO: keep history of linked/unlinked users to position
    if (state.organizations.length === 0) {
      // note: stubbed meId is 1 is a manager of this team
      state.organizations.push({
        name: 'Club Pluto',
        id: 'orgId1',
        // avatar must be buildGravatarUrl(gravatar)
        // TODO: maybe don't save gravatar email or encrypt it
        // example from https://stackoverflow.com/a/54004588
        gravatar: 'jitewaboh@lagify.com',
        avatar:
          'https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b',
        timeZone: 'America/Los_Angeles',
        timeOpen: '11:00',
        timeClose: '02:00',
        rule: defaultTeamRule,
        positions: defaultPositions,
        members: [
          {
            id: 1,
            name: 'John Doe',
            code: 'XSEFG-ABCDR',
            position: 'bar back'
          },
          {
            id: 2,
            name: 'Jack Frat',
            linkedId: meId,
            position: 'bartender',
            manager: true
          },
          {
            id: 3,
            name: 'Jennie Brown',
            linkedId: 3,
            position: 'server',
            manager: true
          },
          // note: terminated is different than deleted as member still shows in old reports
          // terminated are never managers
          // terminated never have an open link code
          // TODO: decide if terminated members should be unlinked
          { id: 4, name: 'Faded Smith', terminated: true, position: 'bar back' }
        ]
      })
    }
  },
  create(
    state,
    { meId, meName, name, gravatar, avatar, timeOpen, timeClose, timeZone }
  ) {
    if (!meId) throw new Error('organizations/create meId invalid')
    const id = (state.organizations.length + 1).toString()
    state.organizations.push({
      id,
      name,
      gravatar,
      avatar,
      timeOpen,
      timeClose,
      timeZone,
      positions: defaultPositions,
      members: [
        // creator is always the first manager
        {
          id: 1,
          position: 'bartender',
          manager: true,
          name: meName,
          linkedId: meId
        }
      ]
    })
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
  memberUpdate(
    state,
    { organizationId, id, terminated, manager, code, ...attrs }
  ) {
    if (terminated) {
      manager = false // too confusing if we allow a terminated manager
      code = null // don't leave open link code for terminated member
    }
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const member = organization.members.find(mbr => id === mbr.id)
    if (!member) return
    Object.assign(member, { terminated, manager, code }, attrs)
  }
}
