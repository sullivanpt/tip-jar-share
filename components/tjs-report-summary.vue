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
        { text: 'position', value: 'position' }
      ]"
      :items="report.reporters"
    >
      <template v-slot:items="props">
        <tr @click="editReporter(props.item.id)">
          <td><v-icon v-text="props.item.done ? 'done' : 'warning'" /></td>
          <td v-text="props.item.name" />
          <td v-text="props.item.position" />
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
