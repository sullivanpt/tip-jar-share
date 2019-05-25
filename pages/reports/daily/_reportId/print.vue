<template>
  <v-container pa-0 grid-list-lg>
    <v-layout column>
      <v-flex>
        <div class="text-xs-right hidden-print">
          <v-btn @click="back"><v-icon>arrow_back</v-icon> back</v-btn>
          <v-btn @click="print"><v-icon>print</v-icon> print</v-btn>
        </div>
        <div class="text-xs-right">
          <i>generated in {{ applicationTitle }} {{ gitRepoVersion }}</i>
        </div>
        <div>Team: <span v-text="organization.name" /></div>
        <div>Date: {{ report.date | formatDate }}</div>
        <div>Status: <span v-text="report.status" /></div>
        <div v-if="errors">
          <v-icon>error</v-icon> WARNING: DETECTED AN INCORRECT SETUP
        </div>
      </v-flex>
      <v-flex v-if="formulaReport">
        <div class="print-table-wrap">
          <table class="print-table">
            <thead>
              <tr>
                <th
                  v-for="head in formulaReport.groupHeaders"
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
                    :colspan="formulaReport.groupHeaders.length"
                    v-text="`${grp.position} position`"
                  />
                </tr>
                <!-- position reporters -->
                <template
                  v-for="rptr in formulaReport.groupedReporters[grpIdx]"
                >
                  <tr :key="`rptr-${grp.allocationId}-${rptr.memberId}`">
                    <td
                      v-for="head in formulaReport.groupHeaders"
                      :key="head.key"
                      :class="head | classByHeader"
                    >
                      {{ rptr[head.key] | formatByHeader(head) }}
                    </td>
                  </tr>
                </template>
                <!-- position collections -->
                <template
                  v-for="col in formulaReport.groupedCollections[grpIdx]"
                >
                  <tr :key="`col-${grp.allocationId}-${col.stationId}`">
                    <td
                      v-for="head in formulaReport.groupHeaders"
                      :key="head.key"
                      :class="head | classByHeader"
                    >
                      <span v-if="head.key === 'name'">
                        <i>tip jar -- </i>{{ col[head.key] }}</span
                      >
                      <span v-else>
                        {{ col[head.key] | formatByHeader(head) }}
                      </span>
                    </td>
                  </tr>
                </template>
                <!-- position subtotals -->
                <tr
                  :key="`grp-sub-${grp.allocationId}`"
                  class="print-table-subtotal"
                >
                  <td
                    v-for="head in formulaReport.groupHeaders"
                    :key="head.key"
                    :class="head | classByHeader"
                  >
                    <span
                      v-if="head.key === 'name'"
                      v-text="`${grp.position} subtotals`"
                    />
                    <span v-else>{{
                      formulaReport.groupedSubtotals[grpIdx][head.key]
                        | formatByHeader(head)
                    }}</span>
                  </td>
                </tr>
                <!-- spacer -->
                <tr :key="`spacer-${grp.allocationId}`">
                  <td :colspan="formulaReport.groupHeaders.length">&nbsp;</td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr class="print-table-total">
                <td
                  v-for="head in formulaReport.groupHeaders"
                  :key="head.key"
                  :class="head | classByHeader"
                >
                  <span v-if="head.key === 'name'">totals</span>
                  <span v-else>{{
                    formulaReport.groupedTotal[head.key] | formatByHeader(head)
                  }}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { applicationTitle, gitRepoVersion } from '~/helpers/site-map.js'
import { formulaFindById } from '~/helpers/formulas'
import { reportDaily } from '~/helpers/formulas-reports'
import { organizationFindById } from '~/helpers/organizations'
import { reportFindById } from '~/helpers/reports'
import { formatDate } from '~/helpers/time'
import { formatCurrency, formatHours, formatPercent } from '~/helpers/math.js'
import { print } from '~/helpers/browser'

function titleByHeader(head) {
  const map = {
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

function classByHeader(head) {
  return head.format === 'string' ? 'print-table-label' : 'print-table-amount'
}

function formatByHeader(v, head) {
  if (head.format === 'currency') return formatCurrency(v)
  if (head.format === 'percent') return formatPercent(v)
  if (head.format === 'hours') return formatHours(v)
  return v
}

export default {
  layout: 'print',
  filters: { classByHeader, formatByHeader, formatDate, titleByHeader },
  data: () => ({
    applicationTitle,
    gitRepoVersion,
    report: null,
    formula: null,
    formulaReport: null, // compute client side to avoid SSR serialization issues with Big
    organization: null
  }),
  computed: {
    errors() {
      return this.formulaReport && Object.keys(this.formulaReport.errors).length
    }
  },
  asyncData({ error, params, store }) {
    const report = reportFindById(store, params.reportId)
    if (!report) {
      return error(nuxtPageNotFound)
    }
    const formula = formulaFindById(store, report.formulaId)
    if (!formula) {
      return error(nuxtPageNotFound)
    }
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    return {
      report,
      formula,
      organization
    }
  },
  mounted() {
    // report is expensive andprobably doesn't serialize well
    // so precompute it once, and do it client side
    this.formulaReport = reportDaily(this.formula, this.report)
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    print() {
      print()
    }
  }
}
</script>

<style>
@media print {
  .hidden-print {
    display: none !important;
  }
}

.print-table-wrap {
  overflow-x: auto;
}

.print-table {
  border-collapse: collapse;
}

.print-table th,
.print-table td {
  border: 1px solid darkgray;
  padding-left: 5px;
  padding-right: 5px;
}

.print-table-label {
  min-width: 20em;
  text-align: left;
}

.print-table-amount {
  min-width: 4em;
  text-align: right;
}

.print-table-subheader {
  font-style: italic;
}

.print-table-subtotal {
  font-style: italic;
  font-weight: bold;
}

.print-table-total {
  font-weight: bold;
}
</style>
