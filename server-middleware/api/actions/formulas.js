import uuidV4 from 'uuid/v4'
import { cloneDeep, pick } from '../../../helpers/nodash'
import { hasOrganizationEdit } from '../../../helpers/organizations'
import { models } from './models'

/**
 * return only the public facing fields
 */
export function formulaPublic(formula) {
  return pick(formula, [
    'id',
    'shared',
    'description',
    'organizationId',
    'reportId',
    'allocations' // WARNING: this is a deep object
  ])
}

export function defaultFormula() {
  return models.formulas.find(fml => !fml.deleted && fml.shared)
}

export function formulasForOrganizations(
  organizationIds,
  includeShared = true
) {
  return models.formulas.filter(fml => {
    if (fml.deleted) return
    if (includeShared && fml.shared) return true
    return organizationIds.includes(fml.organizationId)
  })
}

export function formulaClone(srcFormula, organizationId) {
  srcFormula.cloned = new Date().toISOString()
  const formula = {
    id: uuidV4(),
    shared: false,
    description: srcFormula.description,
    organizationId,
    reportId: null,
    cloned: srcFormula.cloned,
    sourceId: srcFormula.id,
    allocations: cloneDeep(srcFormula.allocations)
  }
  models.formulas.push(formula)
  return formula
}

export function hasFormulaEdit(req, formula) {
  if (!formula.organizationId) return
  const organization = models.organizations.find(
    org => !org.deleted && org.id === formula.organizationId
  )
  if (!organization) throw new Error('formula.organizationId not found')
  return hasOrganizationEdit(req.me.id, organization)
}

/**
 * route handler for partial update
 */
// not currently used
// export function formulaUpdate(req, res, next) {
//   const formula = models.formulas.find(fml => fml.id === req.body.formulaId)
//   if (!formula) return next() // will 404
//   if (!hasFormulaEdit(req, formula)) return resStatus(res, 403)
//   const { description } = req.body
//   // TODO: allow setting shared true
//   if (isString(description)) formula.description = description
//   resJson(res, formulaPublic(formula))
// }
