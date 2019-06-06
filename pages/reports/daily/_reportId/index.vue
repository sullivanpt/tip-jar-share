<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-report-summary :organization="organization" :report="report" />
      </v-flex>
      <v-flex>
        <tjs-formula :formula="formula" readonly @row:edit="editAllocation" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { vmAsCtx } from '~/helpers/form-validation'
import { formulaFindById } from '~/helpers/formulas'
import { organizationFindById } from '~/helpers/organizations'
import { reportFindById } from '~/helpers/reports'
import TjsFormula from '~/components/tjs-formula'
import TjsReportSummary from '~/components/tjs-report-summary'

function stateFromParams({ params, store }) {
  const report = reportFindById(store, params.reportId)
  if (!report) return
  const formula = formulaFindById(store, report.formulaId)
  if (!formula) return
  const organization = organizationFindById(store, report.organizationId)
  if (!organization) return
  return { formula, organization, report }
}

export default {
  components: { TjsFormula, TjsReportSummary },
  validate(ctx) {
    return !!stateFromParams(ctx)
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
    }
  },
  fetch(ctx) {
    const { report } = stateFromParams(ctx)
    return ctx.store.dispatch('refresh', { reports: [report] })
  },
  methods: {
    editAllocation(allocationId) {
      this.$router.push({
        path: `/formulas/${this.formula.id}/allocations/${allocationId}`
      })
    }
  }
}
</script>
