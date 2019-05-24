import { defaultFormulas } from '~/helpers/formulas'
import { reportDaily } from '~/helpers/formulas-reports'

const sampleReport = {
  id: 1,
  organizationId: 123,
  date: '2012-03-27',
  formulaId: 'frm-123', // cloned from organizations.formulaId when report created
  status: 'closed',
  collections: [
    {
      id: 'col-1', // unique ID of this station within a report
      stationId: 'st-1',
      allocationId: 2, // source formulas[].allocations[].id
      position: 'bartender', // name of formula position to apply to funds from this station
      name: 'bar jar', // name of this station (ideally unique within report)
      tipsCash: '123.45' // all amounts are serialized as strings
    }
  ],
  // built from organizations[].members when report created but drifts afterwards
  reporters: [
    {
      id: 1, // reports[].reporters unique index
      memberId: 1, // source organizations[].members[].id
      allocationId: 1, // source formulas[].allocations[].id
      position: 'server', // display only
      name: 'Jennie Brown',
      hours: '6.2',
      salesTotal: '456.78',
      salesExcluded: '12.12',
      tipsPos: '62.1',
      tipsCash: null // all amounts are serialized as strings
    },
    {
      id: 2, // reports[].reporters unique index
      memberId: 2, // source organizations[].members[].id
      allocationId: 1, // source formulas[].allocations[].id
      position: 'server', // display only
      name: 'Jack Brown',
      hours: '3.1',
      salesTotal: '100',
      salesExcluded: '1.9',
      tipsPos: '13.1',
      tipsCash: null // all amounts are serialized as strings
    },
    {
      id: 3, // reports[].reporters unique index
      memberId: 3, // source organizations[].members[].id
      allocationId: 2, // source formulas[].allocations[].id
      position: 'bartender', // display only
      name: 'Mabel Howe',
      hours: '7.25',
      salesTotal: '2345.63',
      salesExcluded: null,
      tipsPos: '218.65',
      tipsCash: null // all amounts are serialized as strings
    },
    {
      id: 4, // reports[].reporters unique index
      memberId: 4, // source organizations[].members[].id
      allocationId: 3, // source formulas[].allocations[].id
      position: 'bar back', // display only
      name: 'Jim Bean',
      hours: '8',
      salesTotal: null,
      salesExcluded: null,
      tipsPos: null,
      tipsCash: null // all amounts are serialized as strings
    }
  ]
}

// WARNING: this test has not been checked for accuracy; it just pins the current behavior
it('formulas-reports', () => {
  const result = reportDaily(defaultFormulas[0], sampleReport)
  expect(JSON.parse(JSON.stringify(result))).toEqual({
    errors: {},
    groupHeaders: [
      { key: 'name', format: 'string', step: 'label' },
      { key: 'hours', format: 'hours', step: 'reported-member' },
      { key: 'hoursWeight', format: 'percent', step: 'subtotal-weight' },
      { key: 'salesTotal', format: 'currency', step: 'reported-member' },
      { key: 'salesExcluded', format: 'currency', step: 'reported-member' },
      { key: 'salesNet', format: 'currency', step: 'derived' },
      { key: 'salesNetWeight', format: 'percent', step: 'subtotal-weight' },
      { key: 'salesContribute', format: 'currency', step: 'derived' },
      { key: 'tipsPos', format: 'currency', step: 'reported-member' },
      { key: 'tipsPosContribute', format: 'currency', step: 'derived' },
      { key: 'tipsPosNet', format: 'currency', step: 'derived' },
      { key: 'tipsPosPooled', format: 'currency', step: 'pooled-pos' },
      { key: 'tipsPosPooledA', format: 'currency', step: 'pooled-pos' },
      { key: 'tipsPosPooledB', format: 'currency', step: 'pooled-pos' },
      { key: 'tipsPosShare', format: 'currency', step: 'distributed' },
      { key: 'tipsPosFinal', format: 'currency', step: 'distributed' },
      { key: 'tipsCash', format: 'currency', step: 'reported-member' },
      { key: 'tipsCashContribute', format: 'currency', step: 'derived' },
      { key: 'tipsCashNet', format: 'currency', step: 'derived' },
      {
        key: 'tipsCashCollected',
        format: 'currency',
        step: 'reported-station'
      },
      { key: 'tipsCashPooled', format: 'currency', step: 'pooled-cash' },
      { key: 'tipsCashPooledA', format: 'currency', step: 'pooled-cash' },
      { key: 'tipsCashPooledB', format: 'currency', step: 'pooled-cash' },
      { key: 'tipsCashShare', format: 'currency', step: 'distributed' },
      { key: 'tipsCashFinal', format: 'currency', step: 'distributed' },
      { key: 'tipsFinal', format: 'currency', step: 'distributed' }
    ],
    groups: [
      { allocationId: 1, position: 'server', rank: '1-server' },
      { allocationId: 2, position: 'bartender', rank: '2-bartender' },
      { allocationId: 3, position: 'bar back', rank: '3-bar back' }
    ],
    groupedCollections: [
      [],
      [{ stationId: 'st-1', name: 'bar jar', tipsCashCollected: '123.45' }],
      []
    ],
    groupedReporters: [
      [
        {
          memberId: 2,
          name: 'Jack Brown',
          hours: '3.1',
          salesTotal: '100',
          salesExcluded: '1.9',
          tipsPos: '13.1',
          tipsCash: null,
          salesNet: '98.1',
          salesContribute: '9.81',
          tipsPosContribute: '0',
          tipsCashContribute: null,
          tipsPosNet: '3.29',
          tipsCashNet: null,
          hoursWeight: '0.33333333333333333333',
          salesNetWeight: '0.1807428697766968826',
          tipsPosShare: '0',
          tipsCashShare: '0',
          tipsPosFinal: '3.29',
          tipsCashFinal: '0',
          tipsFinal: '3.29'
        },
        {
          memberId: 1,
          name: 'Jennie Brown',
          hours: '6.2',
          salesTotal: '456.78',
          salesExcluded: '12.12',
          tipsPos: '62.1',
          tipsCash: null,
          salesNet: '444.66',
          salesContribute: '44.466',
          tipsPosContribute: '0',
          tipsCashContribute: null,
          tipsPosNet: '17.634',
          tipsCashNet: null,
          hoursWeight: '0.66666666666666666667',
          salesNetWeight: '0.8192571302233031174',
          tipsPosShare: '0',
          tipsCashShare: '0',
          tipsPosFinal: '17.634',
          tipsCashFinal: '0',
          tipsFinal: '17.634'
        }
      ],
      [
        {
          memberId: 3,
          name: 'Mabel Howe',
          hours: '7.25',
          salesTotal: '2345.63',
          salesExcluded: null,
          tipsPos: '218.65',
          tipsCash: null,
          salesNet: '2345.63',
          salesContribute: '0',
          tipsPosContribute: '218.65',
          tipsCashContribute: '0',
          tipsPosNet: '0',
          tipsCashNet: '0',
          hoursWeight: '1',
          salesNetWeight: '1',
          tipsPosShare: '245.6334',
          tipsCashShare: '111.105',
          tipsPosFinal: '245.6334',
          tipsCashFinal: '111.105',
          tipsFinal: '356.7384'
        }
      ],
      [
        {
          memberId: 4,
          name: 'Jim Bean',
          hours: '8',
          salesTotal: null,
          salesExcluded: null,
          tipsPos: null,
          tipsCash: null,
          salesNet: null,
          salesContribute: null,
          tipsPosContribute: null,
          tipsCashContribute: null,
          tipsPosNet: null,
          tipsCashNet: null,
          hoursWeight: '1',
          salesNetWeight: null,
          tipsPosShare: '27.2926',
          tipsCashShare: '12.345',
          tipsPosFinal: '27.2926',
          tipsCashFinal: '12.345',
          tipsFinal: '39.6376'
        }
      ]
    ],
    groupedSubtotals: [
      {
        hours: '9.3',
        salesTotal: '556.78',
        salesExcluded: '14.02',
        salesNet: '542.76',
        salesContribute: '54.276',
        tipsPos: '75.2',
        tipsPosContribute: '0',
        tipsPosNet: '20.924',
        tipsCash: null,
        tipsCashContribute: null,
        tipsCashNet: null,
        tipsPosPooled: '54.276',
        tipsCashPooled: null,
        tipsPosPooledA: '0',
        tipsCashPooledA: null,
        tipsPosPooledB: '0',
        tipsCashPooledB: null,
        hoursWeight: '1',
        salesNetWeight: '1',
        tipsPosShare: '0',
        tipsPosFinal: '20.924',
        tipsCashShare: '0',
        tipsCashFinal: '0',
        tipsFinal: '20.924'
      },
      {
        tipsCashCollected: '123.45',
        hours: '7.25',
        salesTotal: '2345.63',
        salesExcluded: null,
        salesNet: '2345.63',
        salesContribute: '0',
        tipsPos: '218.65',
        tipsPosContribute: '218.65',
        tipsPosNet: '0',
        tipsCash: null,
        tipsCashContribute: '0',
        tipsCashNet: '0',
        tipsPosPooled: '218.65',
        tipsCashPooled: '123.45',
        tipsPosPooledA: '272.926',
        tipsCashPooledA: '123.45',
        tipsPosPooledB: '245.6334',
        tipsCashPooledB: '111.105',
        hoursWeight: '1',
        salesNetWeight: '1',
        tipsPosShare: '245.6334',
        tipsPosFinal: '245.6334',
        tipsCashShare: '111.105',
        tipsCashFinal: '111.105',
        tipsFinal: '356.7384'
      },
      {
        hours: '8',
        salesTotal: null,
        salesExcluded: null,
        salesNet: null,
        salesContribute: null,
        tipsPos: null,
        tipsPosContribute: null,
        tipsPosNet: null,
        tipsCash: null,
        tipsCashContribute: null,
        tipsCashNet: null,
        tipsPosPooled: null,
        tipsCashPooled: null,
        tipsPosPooledA: null,
        tipsCashPooledA: null,
        tipsPosPooledB: '27.2926',
        tipsCashPooledB: '12.345',
        hoursWeight: '1',
        salesNetWeight: null,
        tipsPosShare: '27.2926',
        tipsPosFinal: '27.2926',
        tipsCashShare: '12.345',
        tipsCashFinal: '12.345',
        tipsFinal: '39.6376'
      }
    ],
    groupedTotal: {
      hours: '24.55',
      hoursWeight: '3',
      salesTotal: '2902.41',
      salesExcluded: '14.02',
      salesNet: '2888.39',
      salesNetWeight: '2',
      salesContribute: '54.276',
      tipsPos: '293.85',
      tipsPosContribute: '218.65',
      tipsPosNet: '20.924',
      tipsPosPooled: '272.926',
      tipsPosPooledA: '272.926',
      tipsPosPooledB: '272.926',
      tipsPosShare: '272.926',
      tipsPosFinal: '293.85',
      tipsCash: null,
      tipsCashContribute: '0',
      tipsCashNet: '0',
      tipsCashCollected: '123.45',
      tipsCashPooled: '123.45',
      tipsCashPooledA: '123.45',
      tipsCashPooledB: '123.45',
      tipsCashShare: '123.45',
      tipsCashFinal: '123.45',
      tipsFinal: '417.3'
    }
  })
})
