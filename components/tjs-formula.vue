<template>
  <v-card>
    <v-card-title>
      <span class="headline">sharing method</span>
      <v-spacer />
      <v-btn
        v-if="!readonly"
        title="add"
        fab
        small
        color="primary"
        @click="add"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
        clearable
      />
    </v-card-title>
    <v-data-table
      :headers="[
        { text: 'position', value: 'position' },
        { text: 'summary', value: 'distributeBy', sortable: false }
      ]"
      :items="allocations"
      :search="search"
    >
      <template v-slot:items="props">
        <tr @click="edit(props.item.id)">
          <td v-text="props.item.position" />
          <td v-text="props.item.summary" />
        </tr>
      </template>
    </v-data-table>

    <!-- TODO: make this section a user editable form -->
    <v-card-text>
      <v-textarea
        :value="formula.description"
        :hint="`version ${formulaVersion}`"
        readonly
        label="sharing method description"
        persistent-hint
      />
    </v-card-text>
  </v-card>
</template>

<script>
import { arrayToCommaString } from '~/helpers/filters'
import { allocationEmptySteps, formulaGetVersion } from '~/helpers/formulas'

function allocationSummary(alc) {
  const emptySteps = allocationEmptySteps(alc)
  return arrayToCommaString([
    !emptySteps.contribute && 'contribute',
    !emptySteps.transferA && 'share round 1',
    !emptySteps.transferB && 'share round 2'
  ])
}

/**
 * shows a formula summary and a list of formulas[].allocations
 */
export default {
  props: {
    formula: { type: Object, default: () => ({}) },
    readonly: { type: Boolean, default: true }
  },
  data: () => ({
    search: null
  }),
  computed: {
    formulaVersion() {
      return formulaGetVersion(this.formula)
    },
    allocations() {
      if (!this.formula) return []
      return this.formula.allocations.map(alc => ({
        ...alc,
        summary: allocationSummary(alc)
      }))
    }
  },
  methods: {
    add() {
      this.$emit('row:add')
    },
    edit(id) {
      this.$emit('row:edit', id)
    }
  }
}
</script>
