import uuidV4 from 'uuid/v4'
import { resJson, resStatus } from '../connect-helpers'
import { coerceBoolean, isBoolean, isString } from '../../../helpers/nodash'
import { distributeByOptions, reporterFields } from '../../../helpers/formulas'
import { formulaPublic, hasFormulaEdit } from './formulas'
import { models } from './models'

/**
 * route handler to create an allocation
 */
export function formulaAllocationCreate(req, res, next) {
  const formula = models.formulas.find(
    fml => !fml.deleted && fml.id === req.body.formulaId
  )
  if (!formula) return next() // will 404
  if (!hasFormulaEdit(req, formula)) return resStatus(res, 403)
  const { distributeBy, position, transfers } = req.body
  if (!distributeByOptions.includes(distributeBy)) return resStatus(res, 400)
  if (!isString(position) || !position) return resStatus(res, 400) // unique position name required
  if (formula.allocations.find(alc => alc.position === position))
    return resStatus(res, 400)
  if (!transfers) return resStatus(res, 400) // valid transfers object required
  const allocation = {
    id: uuidV4(),
    position,
    hoursShow: coerceBoolean(req.body.hoursShow, true),
    salesTotalShow: coerceBoolean(req.body.salesTotalShow, true),
    salesExcludedShow: coerceBoolean(req.body.salesExcludedShow, true),
    tipsPosShow: coerceBoolean(req.body.tipsPosShow, true),
    tipsCashShow: coerceBoolean(req.body.tipsCashShow, true),
    contributeSalesNetPercent: req.body.contributeSalesNetPercent,
    contributeTipsPosPercent: req.body.contributeTipsPosPercent,
    contributeTipsCashPercent: req.body.contributeTipsCashPercent,
    transfers: transfers.map(trn =>
      trn.map(sttr => ({
        id: uuidV4(),
        allocationId: sttr.allocationId, // can be invalid?
        tipsPosPercent: sttr.tipsPosPercent,
        tipsCashPercent: sttr.tipsCashPercent
      }))
    ),
    distributeBy
  }
  formula.allocations.push(allocation)
  resJson(res, { formulas: [formulaPublic(formula)], lastId: allocation.id })
}

/**
 * route handler to update an allocation
 */
export function formulaAllocationUpdate(req, res, next) {
  const formula = models.formulas.find(
    fml => !fml.deleted && fml.id === req.body.formulaId
  )
  if (!formula) return next() // will 404
  if (!hasFormulaEdit(req, formula)) return resStatus(res, 403)
  const allocation = formula.allocations.find(
    alc => alc.id === req.body.allocationId
  )
  if (!allocation) return next() // will 404
  const { distributeBy, position, transfers } = req.body
  if (distributeBy && !distributeByOptions.includes(distributeBy))
    return resStatus(res, 400)
  if (position && !isString(position)) return resStatus(res, 400) // unique position name required
  if (
    formula.allocations.find(
      alc => alc.id !== allocation.id && alc.position === position
    )
  )
    return resStatus(res, 400)

  if (position) allocation.position = position
  reporterFields.forEach(fld => {
    const v = req.body[fld.enable]
    if (isBoolean(v)) allocation[fld.enable] = v
  })
  const bKeys = [
    'contributeSalesNetPercent',
    'contributeTipsPosPercent',
    'contributeTipsCashPercent'
  ]
  bKeys.forEach(key => {
    const v = req.body[key]
    if (v !== undefined) allocation[key] = v
  })

  if (transfers) {
    allocation.transfers = transfers.map(trn =>
      trn.map(sttr => ({
        id: uuidV4(), // TODO: preserve previous order and IDs
        allocationId: sttr.allocationId, // can be invalid?
        tipsPosPercent: sttr.tipsPosPercent,
        tipsCashPercent: sttr.tipsCashPercent
      }))
    )
  }
  if (distributeBy) allocation.distributeBy = distributeBy
  resJson(res, { formulas: [formulaPublic(formula)], lastId: allocation.id })
}

/**
 * route handler to delete an allocation
 */
export function formulaAllocationDelete(req, res, next) {
  const formula = models.formulas.find(
    fml => !fml.deleted && fml.id === req.body.formulaId
  )
  if (!formula) return next() // will 404
  if (!hasFormulaEdit(req, formula)) return resStatus(res, 403)
  const allocation = formula.allocations.find(
    alc => alc.id === req.body.allocationId
  )
  if (!allocation) return next() // will 404
  formula.allocations = formula.allocations.filter(
    alc => allocation.id !== alc.id
  )
  resJson(res, { formulas: [formulaPublic(formula)], lastId: null })
}
