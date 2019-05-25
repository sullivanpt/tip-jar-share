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
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { formulaFindById } from '~/helpers/formulas'
import { organizationFindById } from '~/helpers/organizations'
import { reportFindById } from '~/helpers/reports'
import TjsFormula from '~/components/tjs-formula'
import TjsReportSummary from '~/components/tjs-report-summary'

export default {
  components: { TjsFormula, TjsReportSummary },
  data: () => ({
    formula: null,
    organization: null,
    report: null
  }),
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
    return { formula, organization, report }
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
