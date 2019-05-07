<template>
  <v-card>
    <v-card-title>
      <span class="headline">staff members</span>
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
        { text: 'nick name', value: 'name' },
        { text: 'position', value: 'position' },
        { text: 'permissions', value: 'edit' }, // TODO: search/sort on computed field here
        { text: 'team code', value: 'code' }
      ]"
      :items="items"
      :search="search"
    >
      <template v-slot:items="props">
        <tr :active="props.item.linkedId === meId" @click="edit(props.item.id)">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.position }}</td>
          <td>
            {{
              [
                props.item.edit && 'edit',
                props.item.linkedId === meId && 'me',
                props.item.away && 'away'
              ] | arrayToCommaString
            }}
          </td>
          <td>
            <span v-if="!readonly" v-text="props.item.code"></span>
            <v-icon v-else-if="props.item.code">visibility</v-icon>
            <v-icon v-if="props.item.linkedId">link</v-icon>
          </td>
        </tr>
      </template>
      <template v-slot:footer>
        <td :colspan="4">
          <v-switch
            v-model="showAway"
            label="show away and retired members"
            hide-details
          />
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
/**
 * remove falsy values, then comma+space separate
 * see https://davidwalsh.name/javascript-tricks
 */
function arrayToCommaString(value) {
  if (!value) return
  return value.filter(Boolean).join(', ')
}

/**
 * shows a list of organizations[].members
 */
export default {
  filters: { arrayToCommaString },
  props: {
    members: { type: Array, default: () => [] },
    meId: { default: null }, // eslint-disable-line vue/require-prop-types
    readonly: { type: Boolean, default: true }
  },
  data: () => ({
    search: null,
    showAway: false
  }),
  computed: {
    items() {
      if (this.showAway) return this.members
      return this.members.filter(mbr => !mbr.away)
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
