import { replaceIn } from '~/helpers/nodash'

export const state = () => ({
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
  expel(state) {
    state.organizations = []
  },
  refresh(state, organizations) {
    state.organizations = organizations
  },
  add(state, organizations) {
    state.organizations = replaceIn(
      state.organizations,
      organizations,
      (a, b) => a.id === b.id
    )
  }
}

export const actions = {
  async join({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationJoin(data)
      await dispatch('add', all, { root: true })
      return all.lastId
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async create({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationCreate(data)
      await dispatch('add', all, { root: true })
      return all.lastId
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async update({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationUpdate(data)
      commit('add', all.organizations)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async delete({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      await this.$api.organizationDelete(data)
      dispatch('refresh', null, { root: true })
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async stationCreate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationStationCreate(data)
      commit('add', all.organizations)
      return all.lastId
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async stationUpdate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationStationUpdate(data)
      commit('add', all.organizations)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async stationDelete({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationStationDelete(data)
      commit('add', all.organizations)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async memberCreate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationMemberCreate(data)
      commit('add', all.organizations)
      return all.lastId
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async memberUpdate({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.organizationMemberUpdate(data)
      commit('add', all.organizations)
      // when unlink from organization make sure report and organization access is removed
      if (all.unlinkedMe) {
        await dispatch(
          'me/selectedOrganizationId',
          { organizationId: null },
          { root: true }
        )
        dispatch('refresh', null, { root: true })
        return 'unlinkedMe'
      }
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  }
}
