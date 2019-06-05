import {
  canDivide,
  fromCurrency,
  fromHours,
  fromPercent,
  opOrNull
} from '~/helpers/math.js'
import { allocationEmptySteps, defaultTransfersState } from '~/helpers/formulas'

//
// Expected print format
// Position bartender ------------------------
// (reporter) Jack                :- xx xx          xx
// (collection) tip jar 1         :-    xx xx
// (allocation) sub totals        :- xx xx xx p1 p2 xx
// grand totals                   :- xx xx xx xx xx xx
//
// ....
//
// these are all max precision Big or null (fromCurrency, etc.)
// const sampleReportDaily = {
//   errors: {}, // accumulates errors if any
//   groupHeaders: [ // ordered headers and formats for each key/column in group table
//     {
//       key: 'memberId',
//       format: 'string', // 'string', 'hours', 'percent', 'currency'
//       step: 'label', reported', 'derived', 'subtotal', 'subtotal-weight', ...
//     }
//   ],
//   groups: [ // headers and base data for each section in group table
//     {
//       allocationId,
//       position,
//       rank, // for alpha sorting groups
//     }
//   ],
//   groupedCollections: [ // one entry per group
//     [ // one entry per collection in group
//       { // all { b, s } except label section
//         // labels -- from collections[]
//         stationId, // to locate unused stations
//         name,
//         // reported -- from collections[]
//         tipsCash,
//         tipsCashCollected // tipsCash renamed
//       }
//     ]
//   ],
//   groupedReporters: [ // one entry per group
//     [ // one entry per reporter in group
//       { // all { b, s } except label section
//         // labels
//         memberId, // to locate unused members
//         name,
//         // reported
//         hours,
//         salesTotal,
//         salesExcluded,
//         tipsPos,
//         tipsCash,
//         tipsCashReported, // tipsCash renamed
//         // derived -- from reporters..hours | salesTotal etc.
//         hoursWeight, // percent daily weight within position
//         salesNet, // salesTotal - salesExcluded
//         salesNetWeight, // percent daily weight within position
//         salesContribute, // salesNet * contributeSalesNetPercent
//         tipsPosContribute, // tipsPos * contributeTipsPosPercent
//         tipsCashContribute, // tipsCashReported * contributeTipsCashPercent
//         tipsPosNet, // tipsPos - tipsPosContribute - salesContribute
//         tipsCashNet, // tipsCashReported - tipsCashContribute
//         // distributed -- from allocationTotals..computed final step (step 2)
//         tipsPosShare, // tipsPosPooled * (hoursWeight | salesWeight)
//         tipsCashShare, // tipsCashPooled * (hoursWeight | salesWeight)
//         tipsPosFinal, // tipsPosShare + tipsPosNet
//         tipsCashFinal, // tipsCashShare + tipsCashNet
//         tipsFinal // tipsPosFinal + tipsCashFinal
//       }
//     ]
//   ],
//   groupedSubtotals: [ // one per entry per group
//     {
//       ...values // same as groupedReporters with groupedCollections
//       // contributed
//       tipsPosPooled, // groupedTotal: salesContribute + tipsPosContribute
//       tipsCashPooled, // groupedTotal.tipsCashContribute + collectionTotals..tipsCashContribute
//       tipsPosPooledA, // tipPosPooled after first transfer
//       tipsCashPooledA,
//       tipsPosPooledB, // tipsPosPooled after second transfer
//       tipsCashPooledB,
//     }
//   ],
//   groupedTotal: { // total over all postion totals
//     ...values // same as groupedSubtotals
//   }
// }

/**
 * total each key across array
 */
function totalKeys(arr, keys, base = {}) {
  return arr.reduce((acc, v) => {
    keys.forEach(key => {
      acc[key] = opOrNull(v[key], 'plus', acc[key] || null)
    })
    return acc
  }, base)
}

/**
 * guess best ordering for positions in report
 */
function allocationRank(alc) {
  const emptySteps = allocationEmptySteps(alc)
  let rank = 0
  if (emptySteps.transferB) rank += 1
  if (emptySteps.transferA) rank += 2
  return `${rank}-${alc.position}`
}

/**
 * report headers: which field, display format, and stage of computation
 * warning: code makes some assumptions about relative order of pooled-xxx entries
 */
function cloneGroupHeaders() {
  return [
    // no -- { key: 'memberId', format: 'string', step: 'label' },
    // no -- { key: 'stationId', format: 'string', step: 'label' },
    { key: 'name', format: 'string', step: 'label' }, // member or station name
    { key: 'hours', format: 'hours', step: 'reported-member' },
    { key: 'hoursWeight', format: 'percent', step: 'subtotal-weight' },
    { key: 'salesTotal', format: 'currency', step: 'reported-member' },
    { key: 'salesExcluded', format: 'currency', step: 'reported-member' },
    { key: 'salesNet', format: 'currency', step: 'derived' },
    { key: 'salesNetWeight', format: 'percent', step: 'subtotal-weight' },
    { key: 'salesContribute', format: 'currency', step: 'derived' },
    { key: 'tipsPos', format: 'currency', step: 'reported-member' },
    { key: 'tipsPosNet', format: 'currency', step: 'derived' },
    { key: 'tipsPosContribute', format: 'currency', step: 'derived' },
    { key: 'tipsPosPooled', format: 'currency', step: 'pooled-pos' },
    { key: 'tipsPosPooledA', format: 'currency', step: 'pooled-pos' },
    { key: 'tipsPosPooledB', format: 'currency', step: 'pooled-pos' },
    { key: 'tipsPosShare', format: 'currency', step: 'distributed' },
    { key: 'tipsPosFinal', format: 'currency', step: 'distributed' },
    { key: 'tipsCash', format: 'currency', step: 'collected-reported' },
    { key: 'tipsCashReported', format: 'currency', step: 'reported-member' },
    { key: 'tipsCashNet', format: 'currency', step: 'derived' },
    { key: 'tipsCashContribute', format: 'currency', step: 'derived' },
    { key: 'tipsCashCollected', format: 'currency', step: 'reported-station' },
    { key: 'tipsCashPooled', format: 'currency', step: 'pooled-cash' },
    { key: 'tipsCashPooledA', format: 'currency', step: 'pooled-cash' },
    { key: 'tipsCashPooledB', format: 'currency', step: 'pooled-cash' },
    { key: 'tipsCashShare', format: 'currency', step: 'distributed' },
    { key: 'tipsCashFinal', format: 'currency', step: 'distributed' },
    { key: 'tipsFinal', format: 'currency', step: 'distributed' }
  ]
}

function filterHeaders(steps) {
  return cloneGroupHeaders()
    .filter(itm => steps.includes(itm.step))
    .map(itm => itm.key)
}

/**
 * typing saver to null one or more keys
 */
function nullHeaderKeys() {
  return cloneGroupHeaders().reduce((acc, head) => {
    acc[head.key] = head.format === 'string' ? '' : null
    return acc
  }, {})
}

/**
 * prepare the data for the printed daily report
 */
export function reportDaily(formula, report) {
  // accumulator for errors
  const errors = {}

  // group by position
  const allocationMap = formula.allocations.reduce((acc, alc) => {
    acc[alc.id] = Object.assign({}, alc) // shallow copy. we'll add groupIdx
    return acc
  }, {})
  const collectionsMap = report.collections.reduce((acc, col) => {
    if (!acc[col.allocationId]) acc[col.allocationId] = []
    acc[col.allocationId].push(col)
    return acc
  }, {})
  const reportersMap = report.reporters.reduce((acc, rptr) => {
    // elide reporters with no data after closed
    if (!rptr.done && report.status === 'closed') return acc
    if (!acc[rptr.allocationId]) acc[rptr.allocationId] = []
    acc[rptr.allocationId].push(rptr)
    return acc
  }, {})

  // build order list of groups
  // sort group members by name while we're there
  const groups = []
  for (const key in reportersMap) {
    reportersMap[key].sort((a, b) => a.name.localeCompare(b.name))
    const { allocationId, position } = reportersMap[key][0]
    const rank = allocationRank(allocationMap[allocationId])
    groups.push({ allocationId, position, rank })
  }
  for (const key in collectionsMap) {
    collectionsMap[key].sort((a, b) => a.name.localeCompare(b.name))
    const { allocationId, position } = collectionsMap[key][0]
    if (!groups.find(grp => grp.allocationId === allocationId)) {
      const rank = allocationRank(allocationMap[allocationId])
      groups.push({ allocationId, position, rank })
    }
  }
  groups.sort((a, b) => a.rank.localeCompare(b.rank)) // TODO: manager sets order

  // build map from allocationMap back to group index
  groups.forEach((grp, idx) => {
    const alc = allocationMap[grp.allocationId]
    alc.groupIdx = idx
  })

  // build collections
  const groupedCollections = groups.map(grp => {
    if (!collectionsMap[grp.allocationId]) return []
    return collectionsMap[grp.allocationId].map(col => {
      // labels and reported
      const v = Object.assign(nullHeaderKeys(), {
        stationId: col.stationId,
        name: col.name,
        tipsCash: fromCurrency(col.tipsCash),
        // we rename tipsCash so we can subtotal it separately from reporters
        tipsCashCollected: fromCurrency(col.tipsCash)
      })
      return v
    })
  })

  // compute collection subtotals (almost always sum of one or no rows)
  const groupedSubtotals = groups.map((grp, idx) => {
    if (!collectionsMap[grp.allocationId]) return nullHeaderKeys()
    const grpCol = groupedCollections[idx]
    return totalKeys(
      grpCol,
      filterHeaders(['reported-station', 'collected-reported']),
      nullHeaderKeys()
    )
  })

  // build reporters (except weights and distributed)
  const groupedReporters = groups.map(grp => {
    if (!reportersMap[grp.allocationId]) return []
    const alc = allocationMap[grp.allocationId]
    return reportersMap[grp.allocationId].map(rpt => {
      // labels and reported
      const v = Object.assign(nullHeaderKeys(), {
        memberId: rpt.memberId,
        name: rpt.name,
        hours: fromHours(rpt.hours),
        salesTotal: fromCurrency(rpt.salesTotal),
        salesExcluded: fromCurrency(rpt.salesExcluded),
        tipsPos: fromCurrency(rpt.tipsPos),
        tipsCash: fromCurrency(rpt.tipsCash),
        // we rename tipsCash so we can subtotal it separately from collections
        tipsCashReported: fromCurrency(rpt.tipsCash)
      })
      // derived, but weights can't be computed yet
      v.salesNet = opOrNull(v.salesTotal, 'minus', v.salesExcluded)
      v.salesContribute = opOrNull(
        v.salesNet,
        'times',
        fromPercent(alc.contributeSalesNetPercent)
      )
      v.tipsPosContribute = opOrNull(
        v.tipsPos,
        'times',
        fromPercent(alc.contributeTipsPosPercent)
      )
      v.tipsCashContribute = opOrNull(
        v.tipsCashReported,
        'times',
        fromPercent(alc.contributeTipsCashPercent)
      )
      v.tipsPosNet = opOrNull(
        v.tipsPos,
        'minus',
        opOrNull(v.tipsPosContribute, 'plus', v.salesContribute)
      )
      v.tipsCashNet = opOrNull(
        v.tipsCashReported,
        'minus',
        v.tipsCashContribute
      )
      return v
    })
  })

  // compute reporters subtotals
  groups.forEach((grp, idx) => {
    if (!reportersMap[grp.allocationId]) return {}
    const grpRptr = groupedReporters[idx]
    groupedSubtotals[idx] = totalKeys(
      grpRptr,
      filterHeaders(['reported-member', 'derived']),
      groupedSubtotals[idx]
    )
  })

  // compute reporter weights
  groups.forEach((grp, idx) => {
    if (!reportersMap[grp.allocationId]) return
    const grpRptr = groupedReporters[idx]
    const grpSubtotal = groupedSubtotals[idx]
    const grpRptrTotalHours = canDivide(grpSubtotal.hours)
    const grpRptrTotalSalesNet = canDivide(grpSubtotal.salesNet)
    grpRptr.forEach(v => {
      v.hoursWeight = opOrNull(v.hours, 'div', grpRptrTotalHours, 'none')
      v.salesNetWeight = opOrNull(
        v.salesNet,
        'div',
        grpRptrTotalSalesNet,
        'none'
      )
    })
  })

  // initialize pools
  groups.forEach((grp, idx) => {
    const grpSubtotal = groupedSubtotals[idx]
    grpSubtotal.tipsPosPooled = opOrNull(
      grpSubtotal.salesContribute,
      'plus',
      grpSubtotal.tipsPosContribute
    )
    grpSubtotal.tipsCashPooled = opOrNull(
      grpSubtotal.tipsCashContribute,
      'plus',
      grpSubtotal.tipsCashCollected
    )
  })

  // constants to help with pool calculations
  const numTransfers = defaultTransfersState().length
  const pooledKeysPos = filterHeaders(['pooled-pos'])
  const pooledKeysCash = filterHeaders(['pooled-cash'])
  if (
    pooledKeysPos.length !== numTransfers + 1 ||
    pooledKeysCash.length !== numTransfers + 1
  )
    throw new Error('reportDaily numTransfers')

  // perform staged transfers
  for (let ti = 0; ti < numTransfers; ti++) {
    const srcKeyIdx = ti
    const dstKeyIdx = ti + 1
    groups.forEach((grp, idx) => {
      const grpSubtotal = groupedSubtotals[idx]
      const srcTipsPos = grpSubtotal[pooledKeysPos[srcKeyIdx]]
      const srcTipsCash = grpSubtotal[pooledKeysCash[srcKeyIdx]]
      let srcTipsPosRemain = srcTipsPos
      let srcTipsCashRemain = srcTipsCash
      // transfer away to other positions
      const stageTrns = allocationMap[grp.allocationId].transfers[ti]
      if (!stageTrns) throw new Error(`reportDaily transfers[${ti}]`)
      stageTrns.forEach(sttr => {
        const dstAlc = allocationMap[sttr.allocationId]
        if (!dstAlc) {
          errors[`trn-${grp.allocationId}-${sttr.allocationId}`] =
            'destination undefined'
          return
        }
        if (dstAlc.groupIdx === undefined) {
          errors[`trn-${grp.allocationId}-${sttr.allocationId}`] =
            'destination no members'
          return
        }
        const dstGrpSubtotal = groupedSubtotals[dstAlc.groupIdx]
        const tipsPosTransferred = opOrNull(
          srcTipsPos,
          'times',
          fromPercent(sttr.tipsPosPercent)
        )
        dstGrpSubtotal[pooledKeysPos[dstKeyIdx]] = opOrNull(
          dstGrpSubtotal[pooledKeysPos[dstKeyIdx]],
          'plus',
          tipsPosTransferred
        )
        srcTipsPosRemain = opOrNull(
          srcTipsPosRemain,
          'minus',
          tipsPosTransferred
        )
        const tipsCashTransferred = opOrNull(
          srcTipsCash,
          'times',
          fromPercent(sttr.tipsCashPercent)
        )
        dstGrpSubtotal[pooledKeysCash[dstKeyIdx]] = opOrNull(
          dstGrpSubtotal[pooledKeysCash[dstKeyIdx]],
          'plus',
          tipsCashTransferred
        )
        srcTipsCashRemain = opOrNull(
          srcTipsCashRemain,
          'minus',
          tipsCashTransferred
        )
      })
      // keep any left overs
      grpSubtotal[pooledKeysPos[dstKeyIdx]] = opOrNull(
        grpSubtotal[pooledKeysPos[dstKeyIdx]],
        'plus',
        srcTipsPosRemain
      )
      grpSubtotal[pooledKeysCash[dstKeyIdx]] = opOrNull(
        grpSubtotal[pooledKeysCash[dstKeyIdx]],
        'plus',
        srcTipsCashRemain
      )
    })
  }

  // distribute pools to members
  groups.forEach((grp, idx) => {
    if (!reportersMap[grp.allocationId]) return
    const grpSubtotal = groupedSubtotals[idx]
    const srcKeyIdx = numTransfers // the final tranfer output
    const tipsPosTransferredFinal = grpSubtotal[pooledKeysPos[srcKeyIdx]]
    const tipsCashTransferredFinal = grpSubtotal[pooledKeysCash[srcKeyIdx]]
    const distributeBy = allocationMap[grp.allocationId].distributeBy
    const grpRptr = groupedReporters[idx]
    grpRptr.forEach(v => {
      // weighted share of pool for reporter
      const weight =
        distributeBy === 'distributeBySalesNet'
          ? v.salesNetWeight
          : v.hoursWeight
      v.tipsPosShare = opOrNull(tipsPosTransferredFinal, 'times', weight)
      v.tipsCashShare = opOrNull(tipsCashTransferredFinal, 'times', weight)
      // final derived values for reporter
      v.tipsPosFinal = opOrNull(v.tipsPosNet, 'plus', v.tipsPosShare)
      v.tipsCashFinal = opOrNull(v.tipsCashNet, 'plus', v.tipsCashShare)
      v.tipsFinal = opOrNull(v.tipsPosFinal, 'plus', v.tipsCashFinal)
    })
  })

  // compute missing subtotals
  groups.forEach((grp, idx) => {
    if (!reportersMap[grp.allocationId]) return {}
    const grpRptr = groupedReporters[idx]
    groupedSubtotals[idx] = totalKeys(
      grpRptr,
      filterHeaders([
        'collected-reported',
        'subtotal-weight',
        'pooled-pos',
        'pooled-cash',
        'distributed'
      ]),
      groupedSubtotals[idx]
    )
  })

  // compute grand totals
  const groupedTotal = totalKeys(
    groupedSubtotals,
    filterHeaders([
      'reported-station',
      'reported-member',
      'collected-reported',
      'derived',
      'pooled-pos',
      'pooled-cash',
      'distributed'
    ]),
    nullHeaderKeys()
  )

  // add errors if stations or members not in report because their assigned position does not existB
  if (report.orphans) errors.orphans = 'member or station positions invalid'
  if (
    report.status !== 'entry' &&
    !opOrNull(
      groupedTotal.tipsPosPooled,
      'eq',
      groupedTotal.tipsPosShare,
      'both'
    )
  )
    errors.posTransfer = 'POS transfer percentages invalid'
  if (
    report.status !== 'entry' &&
    !opOrNull(
      groupedTotal.tipsCashPooled,
      'eq',
      groupedTotal.tipsCashShare,
      'both'
    )
  )
    errors.cashTransfer = 'cash transfer percentages invalid'

  return {
    errors,
    groupHeaders: cloneGroupHeaders(),
    groups,
    groupedCollections,
    groupedReporters,
    groupedSubtotals,
    groupedTotal
  }
}
