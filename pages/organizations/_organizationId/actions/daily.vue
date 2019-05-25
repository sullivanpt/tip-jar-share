<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-confirm-delete
          :show="confirmDelete"
          @cancel="confirmDelete = false"
          @confirm="
            confirmDelete = false
            deleteReport()
          "
        >
          Please enter the digits 1234 to confirm you want to permanently delete
          this report and all its data. Please read the
          <nuxt-link to="/docs/policies">Privacy Policy</nuxt-link>
          for details and exceptions.
        </tjs-confirm-delete>

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
          <v-spacer />
          <v-btn v-if="selectedCanDelete" flat @click="confirmDelete = true"
            ><v-icon>delete</v-icon></v-btn
          >
          <v-btn
            v-if="organizationReadyToReport"
            :disabled="!selectedCanCreate"
            @click="create"
            >create</v-btn
          >
          <v-btn
            v-if="organizationReadyToReport"
            :disabled="!selectedCanView"
            color="primary"
            @click="view"
            ><v-icon>table_chart</v-icon>view</v-btn
          >
          <v-btn
            v-if="!organizationReadyToReport"
            color="primary"
            @click="toOrganization(organization.id)"
            >finish setup</v-btn
          >
        </v-date-picker>
      </v-flex>
      <v-flex v-if="selectedReport">
        <tjs-report-summary
          :organization="organization"
          :report="selectedReport"
          hide-title
        />
      </v-flex>
      <v-flex>
        <tjs-formula
          v-if="selectedFormula"
          :formula="selectedFormula"
          readonly
          @row:edit="editAllocation"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { asValidDateInTz, computeLastOpenDate } from '~/helpers/time'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { formulaFindById } from '~/helpers/formulas'
import {
  hasOrganizationEdit,
  organizationReadyToReport,
  organizationFindById
} from '~/helpers/organizations'
import {
  reportDateWithinRetention,
  reportsFilterByOrganizationId,
  userCanCreateReport
} from '~/helpers/reports'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsFormula from '~/components/tjs-formula'
import TjsReportSummary from '~/components/tjs-report-summary'

export default {
  components: { TjsConfirmDelete, TjsFormula, TjsReportSummary },
  data: () => ({
    confirmDelete: false,
    lastOpenDate: null,
    organization: null,
    selectedDate: null
  }),
  computed: {
    hasMeOrganizationEdit() {
      return hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    organizationReadyToReport() {
      return organizationReadyToReport(this.organization)
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
    selectedFormula() {
      if (!this.selectedReport) return null
      return formulaFindById(this.$store, this.selectedReport.formulaId)
    },
    selectedCanDelete() {
      return (
        this.selectedDate && this.selectedReport && this.hasMeOrganizationEdit
      )
    },
    selectedCanCreate() {
      // a date is selected, report doesn't exist, and user has permission
      return (
        this.organizationReadyToReport &&
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
    toOrganization(organizationId) {
      if (this.selectedOrganizationId !== organizationId) {
        this.$store.dispatch('me/selectedOrganizationId', {
          organizationId
        })
      }
      this.$router.push({ path: `/organizations/${organizationId}` })
    },
    selectionChanged() {
      // want navigate back to remember selectedDate, so save in query
      this.$router.replace({
        query: {
          date: this.selectedDate
        }
      })
    },
    create() {
      this.$store.dispatch('reports/create', {
        organization: this.organization,
        date: this.selectedDate
      })
    },
    view() {
      this.$router.push({
        path: `/reports/daily/${this.selectedReport.id}/print`
      })
    },
    deleteReport() {
      this.$store.dispatch('reports/delete', {
        id: this.selectedReport.id
      })
    },
    editAllocation(allocationId) {
      this.$router.push({
        path: `/formulas/${this.selectedFormula.id}/allocations/${allocationId}`
      })
    }
  }
}
</script>
