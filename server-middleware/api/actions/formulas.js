import uuidV4 from 'uuid/v4'
import { cloneDeep, pick } from '../../../helpers/nodash'
import { hasOrganizationEdit } from '../../../helpers/organizations'
import * as connectors from '../connectors'

/**
 * return only the public facing fields
 */
export function formulaPublic(formula) {
  return pick(formula, [
    'id',
    'hash',
    'shared',
    'description',
    'organizationId',
    'reportId',
    'allocations' // WARNING: this is a deep object
  ])
}

export async function defaultFormula() {
  return (await connectors.formulas.findAllShared())[0]
}

/**
 * does not persist clone to DB
 * @param {*} srcFormula required
 * @param {*} organizationId required
 * @param {*} reportId optional
 */
export function formulaClone(srcFormula, organizationId, reportId) {
  srcFormula.cloned = new Date().toISOString()
  const formula = {
    id: uuidV4(),
    shared: false,
    description: srcFormula.description,
    organizationId,
    reportId: reportId || null,
    cloned: srcFormula.cloned,
    sourceId: srcFormula.id,
    allocations: cloneDeep(srcFormula.allocations)
  }
  return formula
}

export async function hasFormulaEdit(req, formula) {
  if (!formula.organizationId) return
  const organization = await connectors.organizations.findOneByOrganizationId(
    formula.organizationId
  )
  if (!organization) throw new Error('formula.organizationId not found')
  return hasOrganizationEdit(req.me.id, organization)
}

/**
 * route handler for partial update
 */
// not currently used
// export async function formulaUpdate(req, res, next) {
//   let formula = await connectors.formulas.findOneByFormulaId(req.body.formulaId)
//   if (!formula) return next() // will 404
//   if (!(await hasFormulaEdit(req, formula))) return resStatus(res, 403)
//   const { description } = req.body
//   // TODO: allow setting shared true
//   if (isString(description)) formula.description = description
//   formula = await connectors.formulas.updateOne(formula, formula.hash)
//   resJson(res, formulaPublic(formula))
// }
