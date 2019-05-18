// const sampleFormula = {
//   deleted: false, // api side only
//   id: '123-abc',
//   shared: true, // can other orgs see and copy this (e.g. library)
//   description: null, // free form human readable explanation of how this formula works
//   organizationId: 'org-123', // can only be null for prepackaged global formulas
//   reportId: 'rep-123', // if not null only report that references this, or null
//   cloned: 'ISO8601', // when it was created or last used to create a report, for GC
//   sourceId: '122-abc', // null or reference to report used to copy this (target may be deleted)
//   allocations: [ // how each named position/reporter and station/position/collection
//     {
//       id: 'for-123', // unique ID of allocation in this formula
//       position: 'barback', // name of position (unique in this formula)
//       // show/hide reporterFields[].enable
//       hoursShow: true, // collect total hours worked today
//       salesTotalShow: true, // collect total sales for this member today
//       salesExcludedShow: true, // collect sales excluded from salesTotal for tip computation
//       tipsPosShow: true, // collect tips paid by credit cards and other P.O.S. instruments
//       tipsCashShow: true // collect tips paid by cash
//       // TODO: pool: netSales%, tipsPos%, tipsCash%. also station=>position:tipsCash
//       // TODO: share N: { position/formulaId, tipsPos%, tipsCash% }, ...
//       // TODO: distributeByWeightedHours, distributeByWeightedNetSales, distributeEvenlyIfAnyHours?
//     }
//   ],
// }

/**
 * report fields we collect from each member of this position
 * FUTURE: tipsClaimed as option for tipsCash + tipsPos
 */
export const reporterFields = [
  {
    value: 'hours',
    enable: 'hoursShow',
    text: 'hours worked',
    hint: 'total hours you worked today'
  },
  {
    value: 'salesTotal',
    enable: 'salesTotalShow',
    text: 'gross sales',
    hint: 'your gross sales for the day'
  },
  {
    value: 'salesExcluded',
    enable: 'salesExcludedShow',
    text: 'excluded sales',
    hint: 'your excluded sales for the day'
  },
  {
    value: 'tipsPos',
    enable: 'tipsPosShow',
    text: 'CC and POS tips',
    hint: 'total tips you received by credit card and point of sales'
  },
  {
    value: 'tipsCash',
    enable: 'tipsCashShow',
    text: 'cash tips',
    hint: 'total tips you received in cash'
  }
]

export function formulaFindById(store, formulaId) {
  if (!formulaId) return
  return store.state.formulas.formulas.find(
    fml => formulaId.toString() === fml.id.toString()
  )
}

/**
 * builds a helper to map current enable flags by position
 */
export function formulaMapEnabledValues(formula) {
  return formula.allocations.reduce((acc, alc) => {
    if (!alc.position) return // no empties, ignore duplicates
    acc[alc.position] = reporterFields.reduce(
      (acc, fld) => {
        acc[fld.enable] = alc[fld.enable] || false
        acc[fld.value] = null
        return acc
      },
      {
        allocationId: alc.id,
        position: alc.position
      }
    )
    return acc
  }, {})
}

/**
 * minimum fields for a formula, some must be initialzed
 */
export const defaultFormulaState = {
  id: null,
  shared: false,
  description: null,
  organizationId: null,
  reportId: null,
  cloned: null,
  sourceId: null,
  allocations: []
}

/**
 * prepackaged formulas
 * - bar with food service
 * TODO: others
 */
export const defaultFormulas = [
  {
    id: 'bar-with-service',
    description: 'bar with table service',
    shared: true,
    allocations: [
      {
        id: 1,
        position: 'server',
        hoursShow: true,
        salesTotalShow: true,
        salesExcludedShow: true,
        tipsPosShow: true,
        tipsCashShow: true
      },
      {
        id: 2,
        position: 'bartender',
        hoursShow: true,
        salesTotalShow: true,
        salesExcludedShow: false,
        tipsPosShow: true,
        tipsCashShow: false
      },
      {
        id: 3,
        position: 'bar back',
        hoursShow: true,
        salesTotalShow: false,
        salesExcludedShow: false,
        tipsPosShow: false,
        tipsCashShow: false
      }
    ]
  }
].map(fml => Object.assign({}, defaultFormulaState, fml))

/**
 * when constructing a new organization this station
 * is compatible with any of the defaultFormulas
 * {
 *   id: // unique ID of this station within an organization
 *   name: // name of this station (ideally unique within organization)
 *   position: // name of formula position to apply to funds from this station
 * }
 */
export const defaultStations = [{ id: 1, name: 'bar', position: 'bartender' }]
