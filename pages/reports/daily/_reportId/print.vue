<template>
  <v-container pa-0 grid-list-lg>
    <v-layout column>
      <v-flex>
        <div class="text-xs-right hidden-print-only">
          <v-btn @click="back"><v-icon>arrow_back</v-icon> back</v-btn>
          <v-btn @click="print"><v-icon>print</v-icon> print</v-btn>
        </div>
        <div class="text-xs-right caption font-italic">
          <div>generated in {{ applicationTitle }} {{ gitRepoVersion }}</div>
        </div>
        <div>
          Team: <span v-text="organization.name" />
          <span class="caption font-italic">
            &mdash; {{ organizationVersion }}
          </span>
        </div>
        <div>
          Date: <b>{{ report.date | formatDate }}</b>
          <span class="caption font-italic">&mdash; {{ reportVersion }}</span>
        </div>
        <div>Status: <span v-text="report.status" /></div>
        <div v-if="errors">
          <v-icon>error</v-icon> WARNING: DETECTED AN INCORRECT SETUP
        </div>
      </v-flex>
      <v-flex v-if="formulaReport">
        <tjs-formula-report :formula-report="formulaReport" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { formatDate } from '~/helpers/time'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { applicationTitle, gitRepoVersion } from '~/helpers/site-map.js'
import { formulaFindById } from '~/helpers/formulas'
import { reportDaily } from '~/helpers/formulas-reports/daily'
import {
  organizationFindById,
  organizationGetVersion
} from '~/helpers/organizations'
import { reportFindById, reportGetVersion } from '~/helpers/reports'
import { print } from '~/helpers/browser'
import TjsFormulaReport from '~/components/tjs-formula-report'

export default {
  layout: 'print',
  components: { TjsFormulaReport },
  filters: { formatDate },
  data: () => ({
    applicationTitle,
    gitRepoVersion,
    report: null,
    reportVersion: null,
    formula: null,
    formulaReport: null, // compute client side to avoid SSR serialization issues with Big
    organization: null,
    organizationVersion: null
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
    const reportVersion = reportGetVersion(report)
    const formula = formulaFindById(store, report.formulaId)
    if (!formula) {
      return error(nuxtPageNotFound)
    }
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    const organizationVersion = organizationGetVersion(organization)
    return {
      report,
      reportVersion,
      formula,
      organization,
      organizationVersion
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
