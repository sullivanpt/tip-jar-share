import { replaceIn } from '~/helpers/nodash'

export const state = () => ({
  reports: []
})

export const mutations = {
  expel(state) {
    state.reports = []
  },
  refresh(state, reports) {
    state.reports = reports
  },
  add(state, reports) {
    state.reports = replaceIn(state.reports, reports, (a, b) => a.id === b.id)
  },
  remove(state, reportId) {
    state.reports = state.reports.filter(rpt => rpt.id !== reportId)
  }
}

export const actions = {
  async create({ commit, dispatch }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.reportCreate(data)
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
      const all = await this.$api.reportUpdate(data)
      commit('add', all.reports)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async delete({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      await this.$api.reportDelete(data)
      commit('remove', data.reportId)
      // TODO: delete report.formulaId as directed by API
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async collectionUpdate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.reportCollectionUpdate(data)
      commit('add', all.reports)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async reporterUpdate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.reportReporterUpdate(data)
      commit('add', all.reports)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  }
}
