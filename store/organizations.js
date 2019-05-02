import {
  defaultPositions,
  defaultTeamRule
} from '~/helpers/allocations/sales-weighted-group'

export const state = () => ({
  organizations: []
})

export const getters = {
  // TODO: maybe our API should not return members[].code unless user has edit?
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

export const mutations = {
  join(state, { meId }) {
    if (!meId) throw new Error('organizations/join meId invalid')
    // TODO: organizationTeamCode
    // TODO: enforce rate limiter on join; maybe global 1 attempt per second
    // TODO: enforce can only join each time once
    // TODO: keep history of linked/unlinked users to position
    if (state.organizations.length === 0) {
      state.organizations.push({
        name: 'Club Pluto',
        id: 'orgId1',
        // avatar must be buildGravatarUrl(gravatar)
        // TODO: maybe don't save gravatar email or encrypt it
        // example from https://stackoverflow.com/a/54004588
        gravatar: 'jitewaboh@lagify.com',
        avatar:
          'https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b',
        // TODO: consider moving some or all of timeZone, timeOpen, ... into the defaultTeamRule
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
            edit: true
          },
          {
            id: 3,
            name: 'Jennie Brown',
            linkedId: 3,
            position: 'server',
            edit: true
          },
          // note: away is different than deleted as member still shows in old reports
          // away never have edit
          // away never have an open link code
          // TODO: decide if away members should be unlinked
          { id: 4, name: 'Faded Smith', away: true, position: 'bar back' }
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
        // creator is always the first to have edit
        {
          id: 1,
          position: 'bartender',
          edit: true,
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
  memberCreate(state, { organizationId, name, position, code, edit }) {
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
      edit
    })
  },
  memberUpdate(state, { organizationId, id, away, edit, code, ...attrs }) {
    if (away) {
      edit = false // too confusing if we allow a away with edit
      code = null // don't leave open link code for away member
    }
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const member = organization.members.find(mbr => id === mbr.id)
    if (!member) return
    Object.assign(member, { away, edit, code }, attrs)
    // TODO: when unlink from organization make sure report and organization access is removed
  }
}
