<template>
  <v-card>
    <v-card-title v-if="!hideTitle" class="headline">{{
      report.date | formatDate
    }}</v-card-title>
    <v-card-text>
      <v-select
        v-model="reportStatus"
        :items="reportStatusOptions"
        :prepend-icon="reportStatusIcon"
        :readonly="readonly"
        :hint="`version ${reportVersion}`"
        label="report status"
        persistent-hint
      />
    </v-card-text>

    <v-data-table
      :headers="[
        { text: 'completed', value: 'done' },
        { text: 'name', value: 'name' },
        { text: 'position', value: 'position' },
        { text: 'linked', value: 'linkedId' } // TODO: search/sort on computed field here
      ]"
      :items="report.reporters"
    >
      <template v-slot:items="props">
        <tr
          :active="props.item.linkedId === meId"
          @click="editReporter(props.item.id)"
        >
          <td><v-icon v-text="props.item.done ? 'done' : 'warning'" /></td>
          <td v-text="props.item.name" />
          <td v-text="props.item.position" />
          <td>
            <v-icon v-if="props.item.linkedId">link</v-icon>
            <span v-if="props.item.linkedId === meId">me</span>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-data-table
      :headers="[
        { text: 'completed', value: 'done' },
        { text: 'location', value: 'name' }
      ]"
      :items="report.collections"
    >
      <template v-slot:items="props">
        <tr
          :active="props.item.linkedId === meId"
          @click="editCollection(props.item.id)"
        >
          <td><v-icon v-text="props.item.done ? 'done' : 'warning'" /></td>
          <td v-text="props.item.name" />
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { reportGetVersion, reportStatusOptions } from '~/helpers/reports'
import { hasOrganizationClose } from '~/helpers/organizations'
import { formatDate } from '~/helpers/time'

export default {
  filters: { formatDate },
  props: {
    report: { type: Object, default: () => ({}) },
    organization: { type: Object, default: () => ({}) },
    hideTitle: { type: Boolean, default: false }
  },
  computed: {
    reportVersion() {
      return reportGetVersion(this.report)
    },
    reportStatus: {
      get() {
        return this.report.status
      },
      set(status) {
        this.$store.commit('reports/update', {
          id: this.report.id,
          status
        })
      }
    },
    readonly() {
      return !hasOrganizationClose(this.$store.state.me.id, this.organization)
    },
    allReportersDone() {
      if (!this.report || !this.report.reporters) return false
      const allDone = !this.report.reporters.find(rptr => !rptr.done)
      return allDone
    },
    allCollectionsDone() {
      if (!this.report || !this.report.collections) return false
      const allDone = !this.report.collections.find(col => !col.done)
      return allDone
    },
    allDone() {
      return this.allReportersDone && this.allCollectionsDone
    },
    reportStatusOptions() {
      if (this.allDone) return reportStatusOptions
      return reportStatusOptions.filter(status => status !== 'closed')
    },
    reportStatusIcon() {
      return this.report.status === 'closed' || !this.allReportersDone
        ? null
        : 'warning'
    },
    meId() {
      return this.$store.state.me.id
    }
  },
  methods: {
    editCollection(collectionId) {
      this.$router.push({
        path: `/reports/daily/${this.report.id}/collections/${collectionId}`
      })
    },
    editReporter(reporterId) {
      this.$router.push({
        path: `/reports/daily/${this.report.id}/reporters/${reporterId}`
      })
    }
  }
}
</script>
