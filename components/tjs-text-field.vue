<template>
  <v-text-field
    v-model="proxyValue"
    :readonly="readonly"
    :rules="rules"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import { rules } from '~/helpers/form-validation'

/**
 * generic text input with validation
 */
export default {
  model: { prop: 'tjsValue', event: 'update:tjsValue' },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    tjsValue: { default: '' },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    unique: { type: Array, default: () => [] }
  },
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
      return rules({ required: this.required, unique: this.unique })
    }
  }
}
</script>
