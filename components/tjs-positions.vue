<template>
  <v-card>
    <v-card-title>
      <span class="headline">staff positions</span>
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
        { text: 'position', value: 'name' },
        { text: 'allocation rule', value: 'rule' }
      ]"
      :items="positions"
      :search="search"
    >
      <template v-slot:items="props">
        <tr @click="edit(props.item.id)">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.rule }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
/**
 * shows a list of organizations[].positions
 */
export default {
  props: {
    positions: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: true }
  },
  data: () => ({
    search: null
  }),
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
