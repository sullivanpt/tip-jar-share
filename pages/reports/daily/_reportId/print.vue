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
      <v-flex v-for="(grp, grpName) in groupByPosition" :key="grpName">
        <div>Position: <span v-text="grpName" /></div>
        <div class="print-table-wrap">
          <table class="print-table">
            <thead>
              <tr>
                <th class="print-table-label">name</th>
                <th class="print-table-amount">amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rptr in grp.reporters" :key="rptr.id">
                <td class="print-table-label" v-text="rptr.name" />
                <td class="print-table-amount">$0.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="print-table-label"><b>totals</b></td>
                <td class="print-table-amount"><b>$0.00</b></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </v-flex>
      <v-flex>
        <div class="print-table-wrap">
          <table class="print-table">
            <tbody>
              <tr>
                <td class="print-table-label"><b>grand total</b></td>
                <td class="print-table-amount"><b>$0.00</b></td>
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
import { print } from '~/helpers/browser'

export default {
  layout: 'print',
  filters: { formatDate },
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
      // TODO: group totals
      return this.report.reporters.reduce((acc, rptr) => {
        if (!acc[rptr.position]) acc[rptr.position] = { reporters: [] }
        acc[rptr.position].reporters.push(rptr)
        return acc
      }, {})
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
