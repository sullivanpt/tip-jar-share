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
        <div>
          <v-icon v-if="report.status !== 'closed'">error_outline</v-icon>
          Status:
          <span v-text="report.status" />
        </div>
        <div v-if="errors">
          <v-icon>error</v-icon> WARNING: DETECTED AN INCORRECT SETUP
        </div>
      </v-flex>
      <v-flex v-if="formulaReport">
        <span class="title">entered values and take home tips</span>
        <tjs-formula-report
          :formula-report="formulaReport"
          :header-keys="tableA"
        />
      </v-flex>
      <v-flex v-if="formulaReport">
        <div class="title">Worksheets</div>
        <span class="caption">CC and POS tips sharing method</span>
        <tjs-formula-report
          :formula-report="formulaReport"
          :header-keys="tableB"
          worksheet
        />
        <span class="caption">cash tips sharing method</span>
        <tjs-formula-report
          :formula-report="formulaReport"
          :header-keys="tableC"
          worksheet
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { formatDate } from '~/helpers/time'
import { vmAsCtx } from '~/helpers/form-validation'
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

const tableA = [
  'name',
  'hours',
  'salesTotal',
  'salesExcluded',
  'tipsPos',
  'tipsCash',
  'spacer',
  'tipsPosFinal',
  'tipsCashFinal',
  'tipsFinal'
]

const tableB = [
  'name',
  'hoursWeight',
  'salesNet',
  'salesNetWeight',
  'salesContribute',
  'tipsPosContribute',
  'tipsPosNet',
  'tipsPosPooled',
  'tipsPosPooledA',
  'tipsPosPooledB',
  'tipsPosShare',
  'tipsPosFinal'
]

const tableC = [
  'name',
  'hoursWeight',
  'tipsCashContribute',
  'tipsCashNet',
  'tipsCashCollected',
  'tipsCashPooled',
  'tipsCashPooledA',
  'tipsCashPooledB',
  'tipsCashShare',
  'tipsCashFinal'
]

function stateFromParams({ params, store }) {
  const report = reportFindById(store, params.reportId)
  if (!report) return
  const formula = formulaFindById(store, report.formulaId)
  if (!formula) return
  const organization = organizationFindById(store, report.organizationId)
  if (!organization) return
  return { report, formula, organization }
}

export default {
  layout: 'print',
  components: { TjsFormulaReport },
  filters: { formatDate },
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  data() {
    const { report, organization } = stateFromParams(vmAsCtx(this))
    const reportVersion = reportGetVersion(report)
    const organizationVersion = organizationGetVersion(organization)
    return {
      applicationTitle,
      gitRepoVersion,
      reportVersion,
      formulaReport: null, // compute client side to avoid SSR serialization issues with Big
      organizationVersion,
      tableA,
      tableB,
      tableC
    }
  },
  computed: {
    organization() {
      return stateFromParams(vmAsCtx(this)).organization
    },
    formula() {
      return stateFromParams(vmAsCtx(this)).formula
    },
    report() {
      return stateFromParams(vmAsCtx(this)).report
    },
    errors() {
      return this.formulaReport && Object.keys(this.formulaReport.errors).length
    }
  },
  fetch(ctx) {
    const { report } = stateFromParams(ctx)
    return ctx.store.dispatch('refresh', { reports: [report] })
  },
  mounted() {
    // report is expensive andprobably doesn't serialize well
    // so precompute it once, and do it client side
    this.formulaReport = reportDaily(this.formula, this.report)
    if (this.errors) {
      // eslint-disable-next-line no-console
      console.log(
        `errors in daily ${this.report.id}: ${JSON.stringify(
          this.formulaReport.errors
        )}`
      )
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
