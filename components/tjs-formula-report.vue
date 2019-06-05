<template>
  <div class="print-table-wrap">
    <table :class="{ worksheet: worksheet }" class="print-table">
      <thead>
        <tr>
          <th
            v-for="head in headers"
            :key="head.key"
            :class="head | classByHeader"
          >
            {{ head | titleByHeader }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(grp, grpIdx) in formulaReport.groups">
          <!-- e.g. Position bartender -->
          <tr
            :key="`grp-head-${grp.allocationId}`"
            class="print-table-subheader"
          >
            <td
              v-for="head in headers"
              :key="head.key"
              :class="
                head.key === 'spacer'
                  ? 'print-table-spacer'
                  : 'print-table-disable'
              "
            >
              <span
                v-if="head.key === 'name'"
                v-text="`${grp.position} position`"
              />
              <span v-else>&nbsp;</span>
            </td>
          </tr>
          <!-- position reporters -->
          <template v-for="rptr in formulaReport.groupedReporters[grpIdx]">
            <tr :key="`rptr-${grp.allocationId}-${rptr.memberId}`">
              <td
                v-for="head in headers"
                :key="head.key"
                :class="head | classByHeader(rptr[head.key])"
              >
                <span v-if="head.key === 'spacer'">&nbsp;</span>
                <span v-else>{{ rptr[head.key] | formatByHeader(head) }}</span>
              </td>
            </tr>
          </template>
          <!-- position collections -->
          <template v-for="col in formulaReport.groupedCollections[grpIdx]">
            <tr :key="`col-${grp.allocationId}-${col.stationId}`">
              <td
                v-for="head in headers"
                :key="head.key"
                :class="head | classByHeader(col[head.key])"
              >
                <span v-if="head.key === 'name'">
                  <i>tip jar &mdash; </i>{{ col[head.key] }}</span
                >
                <span v-else-if="head.key === 'spacer'">&nbsp;</span>
                <span v-else>
                  {{ col[head.key] | formatByHeader(head) }}
                </span>
              </td>
            </tr>
          </template>
          <!-- position subtotals -->
          <tr :key="`grp-sub-${grp.allocationId}`" class="print-table-subtotal">
            <td
              v-for="head in headers"
              :key="head.key"
              :class="
                head
                  | classByHeader(
                    formulaReport.groupedSubtotals[grpIdx][head.key]
                  )
              "
            >
              <span
                v-if="head.key === 'name'"
                v-text="`${grp.position} subtotals`"
              />
              <span v-else-if="head.key === 'spacer'">&nbsp;</span>
              <span v-else>{{
                formulaReport.groupedSubtotals[grpIdx][head.key]
                  | formatByHeader(head)
              }}</span>
            </td>
          </tr>
          <!-- spacer -->
          <tr :key="`spacer-${grp.allocationId}`">
            <td
              v-for="head in headers"
              :key="head.key"
              :class="
                head.key === 'spacer'
                  ? 'print-table-spacer'
                  : 'print-table-disable'
              "
            >
              &nbsp;
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr class="print-table-total">
          <td
            v-for="head in headers"
            :key="head.key"
            :class="head | classByHeader"
          >
            <span v-if="head.key === 'name'">totals</span>
            <span v-else-if="head.key === 'spacer'">&nbsp;</span>
            <span v-else>{{
              formulaReport.groupedTotal[head.key] | formatByHeader(head)
            }}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import { formatCurrency, formatHours, formatPercent } from '~/helpers/math.js'

function titleByHeader(head) {
  const map = {
    spacer: '', // spacer between columns
    name: 'name', // member or station name
    hours: 'hours',
    hoursWeight: '% hours',
    salesTotal: 'gross sales',
    salesExcluded: 'sales excluded',
    salesNet: 'net sales',
    salesNetWeight: '% net sales',
    salesContribute: 'sales contributed',
    tipsPos: 'POS tips',
    tipsPosContribute: 'POS tips contributed',
    tipsPosNet: 'POS tips held',
    tipsPosPooled: 'total POS contributed',
    tipsPosPooledA: 'intermediate shared POS',
    tipsPosPooledB: 'remaining shared POS',
    tipsPosShare: 'share of remaining POS',
    tipsPosFinal: 'take home POS tips',
    tipsCash: 'cash tips',
    tipsCashReported: 'individual cash tips',
    tipsCashContribute: 'cash tips contributed',
    tipsCashNet: 'cash tips held',
    tipsCashCollected: 'tip jar cash',
    tipsCashPooled: 'total cash contributed',
    tipsCashPooledA: 'intermediate shared cash',
    tipsCashPooledB: 'remaining shared cash',
    tipsCashShare: 'share of remaining cash',
    tipsCashFinal: 'take home cash tips',
    tipsFinal: 'total take home tips'
  }
  return map[head.key] || ''
}

function classByHeader(head, v) {
  if (v === null) return 'print-table-disable'
  if (head.format === 'spacer') return 'print-table-spacer'
  return head.format === 'string' ? 'print-table-label' : 'print-table-amount'
}

function formatByHeader(v, head) {
  if (head.format === 'currency') return formatCurrency(v)
  if (head.format === 'percent') return formatPercent(v)
  if (head.format === 'hours') return formatHours(v)
  return v
}

/**
 * print a portion of a formula-report
 */
export default {
  filters: { classByHeader, formatByHeader, titleByHeader },
  props: {
    formulaReport: { type: Object, default: null },
    headerKeys: { type: Array, default: null },
    worksheet: { type: Boolean, default: false }
  },
  computed: {
    headers() {
      if (!this.headerKeys) return this.formulaReport.groupHeaders
      return this.headerKeys.map(key =>
        key === 'spacer'
          ? { key: 'spacer', format: 'spacer' }
          : this.formulaReport.groupHeaders.find(head => head.key === key)
      )
    }
  }
}
</script>

<style>
.print-table-wrap {
  overflow-x: auto;
}

.print-table {
  border-collapse: collapse;
  font-size: 12px;
}

.print-table.worksheet {
  font-size: 8px;
  opacity: 0.7;
}

.print-table th,
.print-table td {
  border: 1px solid darkgray;
  padding-left: 5px;
  padding-right: 5px;
}

.print-table-spacer {
  max-width: 10px;
  background-color: #555;
}

.print-table-disable {
  background-color: #ddd;
}

.print-table-label {
  min-width: 10em;
  text-align: left;
}

.print-table-amount {
  min-width: 4em;
  text-align: right;
}

.print-table-subheader {
  font-style: italic;
  font-weight: bold;
}

.print-table-subtotal {
  font-style: italic;
  font-weight: bold;
}

.print-table-total {
  font-weight: bold;
}
</style>
