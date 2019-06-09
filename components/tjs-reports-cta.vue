<template>
  <v-flex>
    <no-ssr>
      <v-card v-for="itm in items" :key="itm.date">
        <v-card-text>{{ itm.date | formatDate(organization) }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="itm.report && itm.report.status === 'closed'"
            color="primary"
            @click="view(itm.report)"
            ><v-icon>table_chart</v-icon>view</v-btn
          >
          <v-btn
            v-if="itm.needEditMe"
            color="primary"
            @click="review(itm.report)"
            ><v-icon>warning</v-icon>review</v-btn
          >
          <v-btn v-else-if="itm.report" @click="review(itm.report)"
            >review</v-btn
          >
          <v-btn
            v-if="itm.needEntryMe"
            color="primary"
            @click="entry(itm.report)"
          >
            <v-icon>warning</v-icon> enter values</v-btn
          >
          <v-btn v-if="!itm.report" @click="create(itm.date)"
            >create report</v-btn
          >
        </v-card-actions>
      </v-card>
    </no-ssr>
  </v-flex>
</template>

<script>
import {
  currentReportDates,
  reportFindByOrganizationAndDate,
  reportNeedsEdit,
  reportNeedsEntryUserId
} from '~/helpers/reports'
import {
  hasOrganizationClose,
  organizationFindById
} from '~/helpers/organizations'
import { computeLastOpenDate, formatDate } from '~/helpers/time'

/**
 * show state of current reports for selected organization: yesterday, today
 */
export default {
  filters: { formatDate },
  computed: {
    organization() {
      return organizationFindById(
        this.$store,
        this.$store.state.me.selectedOrganizationId
      )
    },
    currentDates() {
      if (!this.organization) return []
      const lastOpenDate = computeLastOpenDate(this.organization)
      const currentDates = currentReportDates(this.organization, lastOpenDate)
      return currentDates.reverse()
    },
    items() {
      return this.currentDates.map(date => {
        const report = reportFindByOrganizationAndDate(
          this.$store,
          this.organization.id,
          date
        )
        return {
          date,
          needEditMe:
            report &&
            reportNeedsEdit(report) &&
            hasOrganizationClose(this.$store.state.me.id, this.organization),
          needEntryMe:
            report && reportNeedsEntryUserId(this.$store.state.me.id, report),
          report
        }
      })
    }
  },
  methods: {
    view(report) {
      this.$router.push({
        path: `/reports/daily/${report.id}/print`
      })
    },
    review(report) {
      this.$router.push({
        path: `/reports/daily/${report.id}`
      })
    },
    entry(report) {
      const reporter = report.reporters.find(
        rptr => rptr.linkedId === this.$store.state.me.id
      )
      if (!reporter) return // should not happen
      this.$router.push({
        path: `/reports/daily/${report.id}/reporters/${reporter.id}`
      })
    },
    create(date) {
      try {
        this.$store.dispatch('reports/create', {
          organizationId: this.organization.id,
          date
        })
      } catch (e) {}
    }
  }
}
</script>
