import { replaceIn } from '~/helpers/nodash'

/**
 * represents tip sharing formula absent of any personal data
 */
export const state = () => ({
  formulas: []
})

export const getters = {
  formulaOptions(state) {
    return state.formulas.map(fml => ({
      text: fml.name,
      value: fml.id
    }))
  }
}

export const mutations = {
  expel(state) {
    state.formulas = []
  },
  refresh(state, formulas) {
    state.formulas = formulas
  },
  add(state, formulas) {
    state.formulas = replaceIn(
      state.formulas,
      formulas,
      (a, b) => a.id === b.id
    )
  }
}

export const actions = {
  async allocationCreate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.formulaAllocationCreate(data)
      commit('add', all.formulas)
      return all.lastId
    } catch (e) {
      commit('oops', e, { root: true })
      throw e
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async allocationUpdate({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.formulaAllocationUpdate(data)
      commit('add', all.formulas)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  },
  async allocationDelete({ commit }, data) {
    try {
      commit('loadingIncrement', null, { root: true })
      const all = await this.$api.formulaAllocationDelete(data)
      commit('add', all.formulas)
    } catch (e) {
      commit('oops', e, { root: true })
    } finally {
      commit('loadingDecrement', null, { root: true })
    }
  }
}
