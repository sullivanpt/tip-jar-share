<template>
  <v-container pa-0 grid-list-lg>
    <v-layout column>
      <v-flex>
        <div class="text-xs-right">
          <i>generated in {{ applicationTitle }} {{ gitRepoVersion }}</i>
        </div>
        <div>Team: <span v-text="organization.name" /></div>
        <div>Date: <span v-text="report.date" /></div>
        <div>Status: <span v-text="report.status" /></div>
      </v-flex>
      <v-flex v-for="(grp, grpName) in groupByPosition" :key="grpName">
        <div>Position: <span v-text="grpName" /></div>
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rptr in grp.reporters" :key="rptr.id">
              <td v-text="rptr.name" />
              <td>$0.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><b>totals</b></td>
              <td><b>$0.00</b></td>
            </tr>
          </tfoot>
        </table>
      </v-flex>
      <v-flex>
        <div><b>grand totals: $0.00</b></div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { applicationTitle, gitRepoVersion } from '~/helpers/site-map.js'

function organizationFindById(store, organizationId) {
  return store.state.organizations.organizations.find(
    org => organizationId.toString() === org.id.toString()
  )
}

function reportFindById(store, reportId) {
  return store.state.reports.reports.find(
    rpt => reportId.toString() === rpt.id.toString()
  )
}

const nuxtPageNotFound = {
  statusCode: 404,
  message: 'This page could not be found'
}

export default {
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
  }
}
</script>
