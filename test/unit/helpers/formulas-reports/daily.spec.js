import { defaultFormulas } from '~/helpers/formulas'
import { reportDaily } from '~/helpers/formulas-reports/daily'

const sampleReport = {
  id: 'rpt-1',
  organizationId: 'org-1',
  date: '2012-03-27',
  formulaId: 'frm-123', // cloned from organizations.formulaId when report created
  status: 'closed',
  collections: [
    {
      id: 'col-1', // unique ID of this station within a report
      stationId: 'st-1',
      allocationId: 'alc-2-bartender', // source formulas[].allocations[].id
      position: 'bartender', // name of formula position to apply to funds from this station
      name: 'bar jar', // name of this station (ideally unique within report)
      tipsCash: '123.45' // all amounts are serialized as strings
    }
  ],
  // built from organizations[].members when report created but drifts afterwards
  reporters: [
    {
      id: 'rptr-1', // reports[].reporters unique index
      memberId: 'mbr-1', // source organizations[].members[].id
      allocationId: 'alc-1-server', // source formulas[].allocations[].id
      position: 'server', // display only
      name: 'Jennie Brown',
      hours: '6.2',
      salesTotal: '456.78',
      salesExcluded: '12.12',
      tipsPos: '62.1',
      tipsCash: null // all amounts are serialized as strings
    },
    {
      id: 'rptr-2', // reports[].reporters unique index
      memberId: 'mbr-2', // source organizations[].members[].id
      allocationId: 'alc-1-server', // source formulas[].allocations[].id
      position: 'server', // display only
      name: 'Jack Brown',
      hours: '3.1',
      salesTotal: '100',
      salesExcluded: '1.9',
      tipsPos: '13.1',
      tipsCash: null // all amounts are serialized as strings
    },
    {
      id: 'rptr-3', // reports[].reporters unique index
      memberId: 'mbr-3', // source organizations[].members[].id
      allocationId: 'alc-2-bartender', // source formulas[].allocations[].id
      position: 'bartender', // display only
      name: 'Mabel Howe',
      hours: '7.25',
      salesTotal: '2345.63',
      salesExcluded: null,
      tipsPos: '218.65',
      tipsCash: null // all amounts are serialized as strings
    },
    {
      id: 'rptr-4', // reports[].reporters unique index
      memberId: 'mbr-4', // source organizations[].members[].id
      allocationId: 'alc-3-bar-back', // source formulas[].allocations[].id
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
it('formulas-reports/daily', () => {
  const result = reportDaily(defaultFormulas()[0], sampleReport)
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
      { key: 'tipsPosNet', format: 'currency', step: 'derived' },
      { key: 'tipsPosContribute', format: 'currency', step: 'derived' },
      { key: 'tipsPosPooled', format: 'currency', step: 'pooled-pos' },
      { key: 'tipsPosPooledA', format: 'currency', step: 'pooled-pos' },
      { key: 'tipsPosPooledB', format: 'currency', step: 'pooled-pos' },
      { key: 'tipsPosShare', format: 'currency', step: 'distributed' },
      { key: 'tipsPosFinal', format: 'currency', step: 'distributed' },
      { key: 'tipsCash', format: 'currency', step: 'reported-member' },
      { key: 'tipsCashNet', format: 'currency', step: 'derived' },
      { key: 'tipsCashContribute', format: 'currency', step: 'derived' },
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
      { allocationId: 'alc-1-server', position: 'server', rank: '1-server' },
      {
        allocationId: 'alc-2-bartender',
        position: 'bartender',
        rank: '2-bartender'
      },
      {
        allocationId: 'alc-3-bar-back',
        position: 'bar back',
        rank: '3-bar back'
      }
    ],
    groupedCollections: [
      [],
      [
        {
          name: 'bar jar',
          hours: null,
          hoursWeight: null,
          salesTotal: null,
          salesExcluded: null,
          salesNet: null,
          salesNetWeight: null,
          salesContribute: null,
          tipsPos: null,
          tipsPosNet: null,
          tipsPosContribute: null,
          tipsPosPooled: null,
          tipsPosPooledA: null,
          tipsPosPooledB: null,
          tipsPosShare: null,
          tipsPosFinal: null,
          tipsCash: null,
          tipsCashNet: null,
          tipsCashContribute: null,
          tipsCashCollected: '123.45',
          tipsCashPooled: null,
          tipsCashPooledA: null,
          tipsCashPooledB: null,
          tipsCashShare: null,
          tipsCashFinal: null,
          tipsFinal: null,
          stationId: 'st-1'
        }
      ],
      []
    ],
    groupedReporters: [
      [
        {
          name: 'Jack Brown',
          hours: '3.1',
          hoursWeight: '0.33333333333333333333',
          salesTotal: '100',
          salesExcluded: '1.9',
          salesNet: '98.1',
          salesNetWeight: '0.1807428697766968826',
          salesContribute: '9.81',
          tipsPos: '13.1',
          tipsPosNet: '3.29',
          tipsPosContribute: '0',
          tipsPosPooled: null,
          tipsPosPooledA: null,
          tipsPosPooledB: null,
          tipsPosShare: '0',
          tipsPosFinal: '3.29',
          tipsCash: null,
          tipsCashNet: null,
          tipsCashContribute: null,
          tipsCashCollected: null,
          tipsCashPooled: null,
          tipsCashPooledA: null,
          tipsCashPooledB: null,
          tipsCashShare: '0',
          tipsCashFinal: '0',
          tipsFinal: '3.29',
          memberId: 'mbr-2'
        },
        {
          name: 'Jennie Brown',
          hours: '6.2',
          hoursWeight: '0.66666666666666666667',
          salesTotal: '456.78',
          salesExcluded: '12.12',
          salesNet: '444.66',
          salesNetWeight: '0.8192571302233031174',
          salesContribute: '44.466',
          tipsPos: '62.1',
          tipsPosNet: '17.634',
          tipsPosContribute: '0',
          tipsPosPooled: null,
          tipsPosPooledA: null,
          tipsPosPooledB: null,
          tipsPosShare: '0',
          tipsPosFinal: '17.634',
          tipsCash: null,
          tipsCashNet: null,
          tipsCashContribute: null,
          tipsCashCollected: null,
          tipsCashPooled: null,
          tipsCashPooledA: null,
          tipsCashPooledB: null,
          tipsCashShare: '0',
          tipsCashFinal: '0',
          tipsFinal: '17.634',
          memberId: 'mbr-1'
        }
      ],
      [
        {
          name: 'Mabel Howe',
          hours: '7.25',
          hoursWeight: '1',
          salesTotal: '2345.63',
          salesExcluded: null,
          salesNet: '2345.63',
          salesNetWeight: '1',
          salesContribute: '0',
          tipsPos: '218.65',
          tipsPosNet: '0',
          tipsPosContribute: '218.65',
          tipsPosPooled: null,
          tipsPosPooledA: null,
          tipsPosPooledB: null,
          tipsPosShare: '245.6334',
          tipsPosFinal: '245.6334',
          tipsCash: null,
          tipsCashNet: '0',
          tipsCashContribute: '0',
          tipsCashCollected: null,
          tipsCashPooled: null,
          tipsCashPooledA: null,
          tipsCashPooledB: null,
          tipsCashShare: '111.105',
          tipsCashFinal: '111.105',
          tipsFinal: '356.7384',
          memberId: 'mbr-3'
        }
      ],
      [
        {
          name: 'Jim Bean',
          hours: '8',
          hoursWeight: '1',
          salesTotal: null,
          salesExcluded: null,
          salesNet: null,
          salesNetWeight: null,
          salesContribute: null,
          tipsPos: null,
          tipsPosNet: null,
          tipsPosContribute: null,
          tipsPosPooled: null,
          tipsPosPooledA: null,
          tipsPosPooledB: null,
          tipsPosShare: '27.2926',
          tipsPosFinal: '27.2926',
          tipsCash: null,
          tipsCashNet: null,
          tipsCashContribute: null,
          tipsCashCollected: null,
          tipsCashPooled: null,
          tipsCashPooledA: null,
          tipsCashPooledB: null,
          tipsCashShare: '12.345',
          tipsCashFinal: '12.345',
          tipsFinal: '39.6376',
          memberId: 'mbr-4'
        }
      ]
    ],
    groupedSubtotals: [
      {
        name: null,
        hours: '9.3',
        hoursWeight: '1',
        salesTotal: '556.78',
        salesExcluded: '14.02',
        salesNet: '542.76',
        salesNetWeight: '1',
        salesContribute: '54.276',
        tipsPos: '75.2',
        tipsPosNet: '20.924',
        tipsPosContribute: '0',
        tipsPosPooled: '54.276',
        tipsPosPooledA: '0',
        tipsPosPooledB: '0',
        tipsPosShare: '0',
        tipsPosFinal: '20.924',
        tipsCash: null,
        tipsCashNet: null,
        tipsCashContribute: null,
        tipsCashCollected: null,
        tipsCashPooled: null,
        tipsCashPooledA: null,
        tipsCashPooledB: null,
        tipsCashShare: '0',
        tipsCashFinal: '0',
        tipsFinal: '20.924'
      },
      {
        name: null,
        hours: '7.25',
        hoursWeight: '1',
        salesTotal: '2345.63',
        salesExcluded: null,
        salesNet: '2345.63',
        salesNetWeight: '1',
        salesContribute: '0',
        tipsPos: '218.65',
        tipsPosNet: '0',
        tipsPosContribute: '218.65',
        tipsPosPooled: '218.65',
        tipsPosPooledA: '272.926',
        tipsPosPooledB: '245.6334',
        tipsPosShare: '245.6334',
        tipsPosFinal: '245.6334',
        tipsCash: null,
        tipsCashNet: '0',
        tipsCashContribute: '0',
        tipsCashCollected: '123.45',
        tipsCashPooled: '123.45',
        tipsCashPooledA: '123.45',
        tipsCashPooledB: '111.105',
        tipsCashShare: '111.105',
        tipsCashFinal: '111.105',
        tipsFinal: '356.7384'
      },
      {
        name: null,
        hours: '8',
        hoursWeight: '1',
        salesTotal: null,
        salesExcluded: null,
        salesNet: null,
        salesNetWeight: null,
        salesContribute: null,
        tipsPos: null,
        tipsPosNet: null,
        tipsPosContribute: null,
        tipsPosPooled: null,
        tipsPosPooledA: null,
        tipsPosPooledB: '27.2926',
        tipsPosShare: '27.2926',
        tipsPosFinal: '27.2926',
        tipsCash: null,
        tipsCashNet: null,
        tipsCashContribute: null,
        tipsCashCollected: null,
        tipsCashPooled: null,
        tipsCashPooledA: null,
        tipsCashPooledB: '12.345',
        tipsCashShare: '12.345',
        tipsCashFinal: '12.345',
        tipsFinal: '39.6376'
      }
    ],
    groupedTotal: {
      name: null,
      hours: '24.55',
      hoursWeight: null,
      salesTotal: '2902.41',
      salesExcluded: '14.02',
      salesNet: '2888.39',
      salesNetWeight: null,
      salesContribute: '54.276',
      tipsPos: '293.85',
      tipsPosNet: '20.924',
      tipsPosContribute: '218.65',
      tipsPosPooled: '272.926',
      tipsPosPooledA: '272.926',
      tipsPosPooledB: '272.926',
      tipsPosShare: '272.926',
      tipsPosFinal: '293.85',
      tipsCash: null,
      tipsCashNet: '0',
      tipsCashContribute: '0',
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
