<template>
  <v-card>
    <v-card-text>
      <v-select
        :value="report.status"
        :items="reportStatusOptions"
        :prepend-icon="reportStatusIcon"
        label="report status"
        readonly
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
  </v-card>
</template>

<script>
import { reportStatusOptions } from '~/helpers/reports'

export default {
  props: {
    report: { type: Object, default: () => ({}) }
  },
  data: () => ({
    reportStatusOptions
  }),
  computed: {
    reportStatusIcon() {
      return 'warning' // TODO: something helpful based on status and reporters[].done
    },
    meId() {
      return this.$store.state.me.id
    }
  },
  methods: {
    editReporter(reporterId) {
      this.$router.push({
        path: `/reports/daily/${this.report.id}/reporters/${reporterId}`
      })
    }
  }
}
</script>
