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
      :headers="[{ text: 'position', value: 'position' }]"
      :items="allocations"
      :search="search"
    >
      <template v-slot:items="props">
        <tr @click="edit(props.item.id)">
          <td>{{ props.item.position }}</td>
        </tr>
      </template>
    </v-data-table>

    <!-- TODO: make this section a user editable form -->
    <v-card-text>
      <v-textarea
        :value="formula.description"
        readonly
        label="sharing method description"
        hint="short summary of this tip sharing method"
      />
    </v-card-text>
  </v-card>
</template>

<script>
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
    allocations() {
      return this.formula ? this.formula.allocations : []
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
