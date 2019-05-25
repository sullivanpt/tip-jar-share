import { buildGravatarUrl } from '~/helpers/gravatar'
import { emailMask } from '~/helpers/masks'
import { defaultStations } from '~/helpers/formulas'
import { cloneExampleOrganization } from '~/helpers/examples'

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
  /**
   * clear any data
   */
  expel(state) {
    state.organizations = []
  },
  join(state, { meId }) {
    if (!meId) throw new Error('organizations/join meId invalid')
    // TODO: organizationTeamCode
    // TODO: enforce rate limiter on join; maybe global 1 attempt per second
    // TODO: enforce can only join each time once
    // TODO: keep history of linked/unlinked users to position
    state.organizations.push(cloneExampleOrganization(meId))
  },
  create(
    state,
    { meId, meName, name, gravatar, timeOpen, timeClose, timeZone }
  ) {
    if (!meId) throw new Error('organizations/create meId invalid')
    const id = (state.organizations.length + 1).toString()
    const gravatarMasked = emailMask(gravatar) || null
    const avatar = buildGravatarUrl(gravatar) || null
    state.organizations.push({
      id,
      name,
      gravatarMasked,
      avatar,
      timeOpen,
      timeClose,
      timeZone,
      formulaId: null, // cannot really be null (chicken and egg)
      stations: defaultStations,
      members: [
        // creator is always the first to have edit
        {
          id: 1,
          position: 'bartender',
          edit: true,
          close: true,
          name: meName,
          linkedId: meId
        }
      ]
    })
  },
  update(state, { id, gravatar, ...attrs }) {
    const organization = state.organizations.find(org => id === org.id)
    if (!organization) return
    if (gravatar !== undefined && gravatar !== organization.gravatarMasked) {
      const gravatarMasked = emailMask(gravatar) || null
      const avatar = buildGravatarUrl(gravatar) || null
      Object.assign(attrs, { gravatarMasked, avatar })
    }
    Object.assign(organization, attrs)
  },
  delete(state, { id }) {
    state.organizations = state.organizations.filter(org => id !== org.id)
  },
  stationCreate(state, { organizationId, name, position }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const id = (organization.stations.length + 1).toString()
    organization.stations.push({
      id,
      name,
      position
    })
  },
  stationUpdate(state, { organizationId, id, ...attrs }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    const station = organization.stations.find(stn => id === stn.id)
    if (!station) return
    Object.assign(station, attrs)
  },
  stationDelete(state, { organizationId, id }) {
    const organization = state.organizations.find(
      org => organizationId === org.id
    )
    if (!organization) return
    organization.stations = organization.stations.filter(stn => id !== stn.id)
  },
  memberCreate(state, { organizationId, name, position, code, edit, close }) {
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
      edit,
      close
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

export const actions = {
  /**
   * create a new organization and attach a default formula
   */
  create({ state, commit, getters, rootGetters }, data) {
    commit('create', data)
    const organization = state.organizations.find(
      org => org.id === getters.lastId
    )
    const srcFormula = rootGetters['formulas/defaultFormula']
    commit('formulas/clone', { organization, srcFormula }, { root: true })
    const formulaId = rootGetters['formulas/lastId']
    commit('update', { id: organization.id, formulaId })
    return organization.id
  },
  async join({ state, commit, dispatch, getters, rootGetters }, data) {
    if (state.organizations.length)
      throw new Error('organizations/join code invalid')
    commit('join', data)
    const organization = state.organizations.find(
      org => org.id === getters.lastId
    )
    const srcFormula = rootGetters['formulas/defaultFormula']
    commit('formulas/clone', { organization, srcFormula }, { root: true })
    const formulaId = rootGetters['formulas/lastId']
    commit('update', { id: organization.id, formulaId })
    // now fake a report
    const reportId = await dispatch(
      'reports/create',
      {
        organization,
        date: '2019-05-23'
      },
      { root: true }
    )
    commit('reports/populate', { id: reportId }, { root: true })
    return organization.id
  },
  delete({ state, commit }, { id }) {
    const organization = state.organizations.find(org => id === org.id)
    if (!organization) return
    if (organization.formulaId)
      commit('formulas/delete', { id: organization.formulaId }, { root: true })
    commit('delete', { id })
  }
}
