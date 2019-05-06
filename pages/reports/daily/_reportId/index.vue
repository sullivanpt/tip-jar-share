<template>
  <tjs-report-summary :organization="organization" :report="report" />
</template>

<script>
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { organizationFindById } from '~/helpers/organizations'
import { reportFindById } from '~/helpers/reports'
import TjsReportSummary from '~/components/tjs-report-summary'

export default {
  components: { TjsReportSummary },
  data: () => ({
    organization: null,
    report: null
  }),
  asyncData({ error, params, store }) {
    const report = reportFindById(store, params.reportId)
    if (!report) {
      return error(nuxtPageNotFound)
    }
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    return { organization, report }
  }
}
</script>
