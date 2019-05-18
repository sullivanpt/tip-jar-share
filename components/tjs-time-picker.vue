<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    :return-value.sync="proxyValue"
    lazy
    transition="scale-transition"
    offset-y
    full-width
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="proxyValue"
        :rules="rules"
        v-bind="$attrs"
        prepend-icon="access_time"
        readonly
        v-on="!readonly && on"
      />
    </template>
    <v-time-picker
      v-if="menu"
      v-model="proxyValue"
      format="24hr"
      no-title
      scrollable
      @click:minute="$refs.menu.save(proxyValue)"
    ></v-time-picker>
  </v-menu>
</template>

<script>
import { rules } from '~/helpers/form-validation'

/**
 * show or pick a time in 24 hour format HH:MM
 */
export default {
  inheritAttrs: false,
  model: { prop: 'tjsValue', event: 'update:tjsValue' },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    tjsValue: { default: '' },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  data: () => ({
    menu: false
  }),
  computed: {
    proxyValue: {
      get() {
        return this.tjsValue
      },
      set(value) {
        this.$emit('update:tjsValue', value)
      }
    },
    rules() {
      return rules({ required: this.required })
    }
  }
}
</script>
