<template>
  <div>report {{ report.date }} reporter {{ reporter.name }}</div>
</template>

<script>
function reportFindById(store, reportId) {
  return store.state.reports.reports.find(
    rpt => reportId.toString() === rpt.id.toString()
  )
}

function reporterFindById(report, reporterId) {
  return report.reporters.find(
    rptr => reporterId.toString() === rptr.id.toString()
  )
}

const nuxtPageNotFound = {
  statusCode: 404,
  message: 'This page could not be found'
}

export default {
  data: () => ({
    report: null,
    reporter: null
  }),
  asyncData({ error, params, store }) {
    const report = reportFindById(store, params.reportId)
    if (!report) {
      return error(nuxtPageNotFound)
    }
    const reporter = reporterFindById(report, params.reporterId)
    if (!reporter) {
      return error(nuxtPageNotFound)
    }
    return {
      report,
      reporter
    }
  }
}
</script>
