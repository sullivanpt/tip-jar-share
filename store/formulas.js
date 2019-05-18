import { cloneDeep } from '~/helpers/nodash'
import { defaultFormulas, reporterFields } from '~/helpers/formulas'

/**
 * represents tip sharing formula absent of any personal data
 */
export const state = () => ({
  formulas: defaultFormulas
})

export const getters = {
  formulaOptions(state) {
    return state.formulas.map(fml => ({
      text: fml.name,
      value: fml.id
    }))
  },
  defaultFormula(state) {
    return state.formulas.find(fml => fml.shared)
  },
  // TODO: when dispatch is implemented thosecan return IDs of new items
  lastId(state) {
    return state.formulas.length && state.formulas.slice(-1)[0].id
  },
  // TODO: will not need this with API
  allFormulas(state) {
    return state.formulas
  }
}

export const mutations = {
  /**
   * clear any data, reinstall defaults
   */
  expel(state) {
    state.formulas = cloneDeep(defaultFormulas)
  },
  /**
   * create a new formula
   * note reportId must be set via update (chicken and egg)
   */
  create(state, { organization }) {
    if (!organization) throw new Error('formulas/create organization invalid')
    state.formulas.push({
      id: state.rules.length + 1,
      shared: false,
      description: null,
      organizationId: organization.id,
      reportId: null,
      cloned: new Date().toISOString(),
      sourceId: null,
      allocations: []
    })
  },
  /**
   * create a new formula from an existing formula
   * updates srcFormula.copied
   * note reportId must be set via update (chicken and egg)
   */
  clone(state, { organization, srcFormula }) {
    if (!organization) throw new Error('formulas/clone organization invalid')
    if (!srcFormula) throw new Error('formulas/clone srcFormula invalid')
    srcFormula.cloned = new Date().toISOString()
    const allocations = srcFormula.allocations.map(alc =>
      Object.assign({}, alc)
    ) // shallow copy
    state.formulas.push({
      id: state.formulas.length + 1,
      shared: false,
      description: srcFormula.description,
      organizationId: organization.id,
      reportId: null,
      cloned: srcFormula.cloned,
      sourceId: srcFormula.id,
      allocations
    })
  },
  update(state, { id, ...attrs }) {
    const formula = state.formulas.find(fml => id === fml.id)
    if (!formula) return
    Object.assign(formula, attrs)
  },
  // note: these are also garbage collected
  delete(state, { id }) {
    state.formulas = state.formulas.filter(fml => fml.shared || id !== fml.id)
  },
  allocationCreate(state, { formulaId, ...attrs }) {
    const formula = state.formulas.find(fml => formulaId === fml.id)
    if (!formula) return
    const id = (formula.allocations.length + 1).toString()
    formula.allocations.push(
      Object.assign(
        {},
        reporterFields.reduce((acc, v) => {
          acc[v.enable] = true
          return acc
        }, {}),
        {
          id,
          ...attrs
        }
      )
    )
  },
  allocationUpdate(state, { formulaId, id, ...attrs }) {
    const formula = state.formulas.find(fml => formulaId === fml.id)
    if (!formula) return
    const allocation = formula.allocations.find(alc => id === alc.id)
    if (!allocation) return
    Object.assign(allocation, attrs)
  },
  allocationDelete(state, { formulaId, id }) {
    const formula = state.formulas.find(fml => formulaId === fml.id)
    if (!formula) return
    formula.allocations = formula.allocations.filter(alc => id !== alc.id)
  }
}
