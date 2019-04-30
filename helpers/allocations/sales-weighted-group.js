/**
 * list of all supported allocation rules
 */
export const teamRuleNameOptions = ['sales-weighted-group-pool']

export const defaultPositions = [
  // enters:
  // - hours worked
  // - total sales
  // - excluded sales
  // - claimed tips
  { id: 1, name: 'server', rule: 'in/out:server-pool in:bar-pool' },
  // enters (closing bartender enters on behalf of):
  // - hours worked
  { id: 2, name: 'bar back', rule: 'out:bar-pool' },
  // enters:
  // - hours worked
  // - total sales
  // - cc tips -- TODO: what does "CC" mean?
  // only closing bartender enters (entered once, not per member)
  // - bar's tip jar total
  { id: 3, name: 'bartender', rule: 'in/out:bar-pool' }
  // TODO: 'kitchen crew', 'food runner', 'busser', 'host'
]

export const defaultTeamRule = {
  name: 'sales-weighted-group-pool',
  // TODO: use fixed point variables
  serverSalesPercenToBarTip: 1, // %, Servers to Bar Tip Rate % of Sales
  bartenderTipPercentToBarBackTip: 1 // %, Bar Tenders to Bar Back Tip Rate
}
