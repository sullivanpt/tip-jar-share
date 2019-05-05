<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <v-date-picker
          v-model="selectedDate"
          :min="minDate"
          :max="maxDate"
          :events="reportDates"
          :landscape="$vuetify.breakpoint.smAndUp"
          event-color="primary"
          full-width
          @input="selectionChanged"
        >
          <v-spacer></v-spacer>
          <v-btn :disabled="!selectedCanCreate" @click="create">create</v-btn>
          <v-btn :disabled="!selectedCanView" color="primary" @click="view"
            >view</v-btn
          >
        </v-date-picker>
      </v-flex>
      <v-flex v-if="selectedReport">
        <tjs-report-summary :report="selectedReport" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TjsReportSummary from '~/components/tjs-report-summary'

/**
 * extract TZ date in form YYYY-MM-DD
 * TODO: use organization.timeZone, especially server side
 */
function dateInTz(date = new Date()) {
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const dom = ('0' + date.getDate()).slice(-2)
  return `${year}-${month}-${dom}`
}

function asValidDate(s) {
  try {
    const d = new Date(s)
    if (isNaN(d)) return
    // TODO: not sure why this is needed
    // adjust the time to pretend it is UTC
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
    return d
  } catch (e) {
    // ignore error, return undefined
  }
}

function organizationFindById(store, organizationId) {
  return store.state.organizations.organizations.find(
    org => organizationId.toString() === org.id.toString()
  )
}

function reportsFilterByOrganizationId(store, organizationId) {
  return store.state.reports.reports.filter(
    rpt => organizationId.toString() === rpt.organizationId.toString()
  )
}

const nuxtPageNotFound = {
  statusCode: 404,
  message: 'This page could not be found'
}

export default {
  components: { TjsReportSummary },
  data: () => ({
    organization: null,
    selectedDate: null
  }),
  computed: {
    minDate() {
      // assume rentention is 90 days
      // See https://stackoverflow.com/a/1296374
      // TODO: set this limit dynamically based on organization.retention
      const retention = 90
      const d = new Date()
      d.setDate(d.getDate() - retention)
      return dateInTz(d)
    },
    maxDate() {
      // TODO: adjust TZ, especially server side
      // TODO: allow selection of tomorrow?
      return dateInTz()
    },
    reports() {
      return reportsFilterByOrganizationId(this.$store, this.organization.id)
    },
    reportDates() {
      // list of date strings used in existing reports
      // TODO: consider varying event color by rpt.status
      return this.reports.map(rpt => rpt.date)
    },
    selectedReport() {
      return this.reports.find(rpt => rpt.date === this.selectedDate)
    },
    selectedCanCreate() {
      return this.selectedDate && !this.selectedCanView
    },
    selectedCanView() {
      return !!this.selectedReport
    }
  },
  asyncData({ error, params, query, store }) {
    // TODO: await store.dispatch('organizations/load')
    const organization = organizationFindById(store, params.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    // restore the selection, do simple date validation
    let selectedDate = dateInTz()
    if (query.date) {
      const validated = asValidDate(query.date)
      if (!validated) {
        return error(nuxtPageNotFound)
      }
      selectedDate = dateInTz(validated)
    }
    return { organization, selectedDate }
  },
  methods: {
    selectionChanged() {
      // want navigate back to remember selectedDate, so save in query
      this.$router.replace({
        query: {
          date: this.selectedDate
        }
      })
    },
    create() {
      this.$store.commit('reports/create', {
        organization: this.organization,
        date: this.selectedDate
      })
    },
    view() {
      this.$router.push({
        path: `/reports/daily/${this.selectedReport.id}/print`
      })
    }
  }
}
</script>
