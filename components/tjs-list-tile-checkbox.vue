<template>
  <v-list-tile>
    <v-list-tile-action>
      <v-checkbox v-model="proxyValue" :readonly="readonly"></v-checkbox>
    </v-list-tile-action>
    <v-list-tile-content @click="toggle">
      <v-list-tile-title v-text="label" />
      <v-list-tile-sub-title v-text="hint" />
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
/**
 * one tile in a list of checkboxes
 * <v-list subheader two-line>
 *   <v-subheader>reported fields</v-subheader>
 *   <tjs-list-tile-checkbox ...
 */
export default {
  model: { prop: 'tjsValue', event: 'update:tjsValue' },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    tjsValue: { default: '' },
    readonly: { type: Boolean, default: false },
    label: { type: String, default: null },
    hint: { type: String, default: null }
  },
  computed: {
    proxyValue: {
      get() {
        return this.tjsValue
      },
      set(value) {
        this.$emit('update:tjsValue', value)
      }
    }
  },
  methods: {
    toggle() {
      if (this.readonly) return
      this.proxyValue = !this.proxyValue
    }
  }
}
</script>
