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
      </v-flex>
      <v-flex v-if="report.collections.length">
        <div>Cash jar stations</div>
        <div class="print-table-wrap">
          <table class="print-table">
            <thead>
              <tr>
                <th class="print-table-label">name</th>
                <th class="print-table-amount">cash tips</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stn in report.collections" :key="stn.id">
                <td class="print-table-label" v-text="stn.name" />
                <td class="print-table-amount">
                  {{ stn.tipsCash | formatCurrency }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="print-table-label"><b>totals</b></td>
                <td class="print-table-amount">
                  <b>{{ collectionsTotals.tipsCash | formatCurrency }}</b>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </v-flex>
      <v-flex v-for="(grp, grpName) in groupByPosition" :key="grpName">
        <div>Position: <span v-text="grpName" /></div>
        <div class="print-table-wrap">
          <table class="print-table">
            <thead>
              <tr>
                <th class="print-table-label">name</th>
                <th class="print-table-amount">hours</th>
                <th class="print-table-amount">total sales</th>
                <th class="print-table-amount">excluded sales</th>
                <th class="print-table-amount">CC and POS tips</th>
                <th class="print-table-amount">cash tips</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rptr in grp.reporters" :key="rptr.id">
                <td class="print-table-label" v-text="rptr.name" />
                <td class="print-table-amount">{{ rptr.hours }}</td>
                <td class="print-table-amount">
                  {{ rptr.salesTotal | formatCurrency }}
                </td>
                <td class="print-table-amount">
                  {{ rptr.salesExcluded | formatCurrency }}
                </td>
                <td class="print-table-amount">
                  {{ rptr.tipsPos | formatCurrency }}
                </td>
                <td class="print-table-amount">
                  {{ rptr.tipsCash | formatCurrency }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="print-table-label"><b>totals</b></td>
                <td class="print-table-amount">
                  <b>{{ grp.totals.hours }}</b>
                </td>
                <td class="print-table-amount">
                  <b>{{ grp.totals.salesTotal | formatCurrency }}</b>
                </td>
                <td class="print-table-amount">
                  <b>{{ grp.totals.salesExcluded | formatCurrency }}</b>
                </td>
                <td class="print-table-amount">
                  <b>{{ grp.totals.tipsPos | formatCurrency }}</b>
                </td>
                <td class="print-table-amount">
                  <b>{{ grp.totals.tipsCash | formatCurrency }}</b>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </v-flex>
      <v-flex>
        <div class="print-table-wrap">
          <table class="print-table">
            <thead>
              <tr>
                <th class="print-table-label">grand totals</th>
                <th class="print-table-amount">CC and POS tips</th>
                <th class="print-table-amount">cash tips</th>
                <th class="print-table-amount">combined tips</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>tips</b></td>
                <td class="print-table-amount">
                  <b>{{ grand.tipsPos | formatCurrency }}</b>
                </td>
                <td class="print-table-amount">
                  <b>{{ grand.tipsCash | formatCurrency }}</b>
                </td>
                <td class="print-table-amount">
                  <b>{{ grand.tipsClaimed | formatCurrency }}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { applicationTitle, gitRepoVersion } from '~/helpers/site-map.js'
import { organizationFindById } from '~/helpers/organizations'
import { reportFindById } from '~/helpers/reports'
import { formatDate } from '~/helpers/time'
import {
  formatCurrency,
  fromCurrency,
  fromHours,
  toCurrency,
  toHours
} from '~/helpers/math.js'
import { print } from '~/helpers/browser'

function totalCurrency(arr, key, base = fromCurrency('0')) {
  return toCurrency(
    arr.reduce((acc, obj) => {
      if (obj[key]) acc = acc.plus(fromCurrency(obj[key]))
      return acc
    }, base)
  )
}

function totalHours(arr, key) {
  return toHours(
    arr.reduce((acc, obj) => {
      if (obj[key]) acc = acc.plus(fromHours(obj[key]))
      return acc
    }, fromHours('0'))
  )
}

export default {
  layout: 'print',
  filters: { formatCurrency, formatDate },
  data: () => ({
    applicationTitle,
    gitRepoVersion,
    report: null,
    organization: null
  }),
  computed: {
    /**
     * report.reporters[] => { [rptr.position]: { reporters[] } }
     */
    groupByPosition() {
      const groups = this.report.reporters.reduce((acc, rptr) => {
        if (!acc[rptr.position]) acc[rptr.position] = { reporters: [] }
        acc[rptr.position].reporters.push(rptr)
        return acc
      }, {})
      Object.keys(groups).forEach(key => {
        const grp = groups[key]
        grp.totals = {
          hours: totalHours(grp.reporters, 'hours'),
          salesTotal: totalCurrency(grp.reporters, 'salesTotal'),
          salesExcluded: totalCurrency(grp.reporters, 'salesExcluded'),
          tipsPos: totalCurrency(grp.reporters, 'tipsPos'),
          tipsCash: totalCurrency(grp.reporters, 'tipsCash')
        }
      })
      return groups
    },
    collectionsTotals() {
      return {
        tipsCash: totalCurrency(this.report.collections, 'tipsCash')
      }
    },
    grand() {
      const r = {
        tipsPos: totalCurrency(this.report.reporters, 'tipsPos'),
        tipsCash: totalCurrency(
          this.report.reporters,
          'tipsCash',
          fromCurrency(this.collectionsTotals.tipsCash) // TODO: avoid this extra conversion?
        )
      }
      r.tipsClaimed = toCurrency(
        fromCurrency(r.tipsPos).plus(fromCurrency(r.tipsCash))
      )
      return r
    }
  },
  asyncData({ error, params, store }) {
    const report = reportFindById(store, params.reportId)
    if (!report) {
      return error(nuxtPageNotFound)
    }
    // TODO: await store.dispatch('organizations/load')
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    return {
      report,
      organization
    }
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
</style>
