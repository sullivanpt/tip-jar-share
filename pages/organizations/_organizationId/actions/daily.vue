<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <v-date-picker
          v-model="selectedDate"
          :min="limits.minDate"
          :max="limits.maxDate"
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
import { asValidDateInTz, computeLastOpenDate } from '~/helpers/time'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import {
  reportDateWithinRetention,
  reportsFilterByOrganizationId,
  userCanCreateReport
} from '~/helpers/reports'
import TjsReportSummary from '~/components/tjs-report-summary'

export default {
  components: { TjsReportSummary },
  data: () => ({
    lastOpenDate: null,
    organization: null,
    selectedDate: null
  }),
  computed: {
    hasMeOrganizationEdit() {
      return hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    limits() {
      return reportDateWithinRetention(this.lastOpenDate)
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
      // a date is selected, report doesn't exist, and user has permission
      return (
        this.selectedDate &&
        !this.selectedCanView &&
        userCanCreateReport(
          this.hasMeOrganizationEdit,
          this.lastOpenDate,
          this.selectedDate
        )
      )
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
    const lastOpenDate = computeLastOpenDate(organization)
    const selectedDate = query.date ? asValidDateInTz(query.date) : lastOpenDate
    if (!selectedDate) {
      return error(nuxtPageNotFound)
    }
    return { lastOpenDate, organization, selectedDate }
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
