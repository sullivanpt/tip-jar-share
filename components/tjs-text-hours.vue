<template>
  <v-text-field
    v-model="value"
    :readonly="readonly"
    :rules="rules"
    :hint="hint"
    :persistent-hint="!!value"
    type="number"
    prepend-icon="timelapse"
    v-bind="$attrs"
    v-on="$listeners"
    @change="update"
  />
</template>

<script>
import { formatHoursAndMinutes, fromHours, toHours } from '~/helpers/math'
import { rules } from '~/helpers/form-validation'

/**
 * hours (worked) input with string as base type
 */
export default {
  model: { prop: 'tjsValue', event: 'update:tjsValue' },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    tjsValue: { default: '' },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    hintEmpty: { type: String, default: '' }
  },
  data: () => ({
    value: null
  }),
  computed: {
    rules() {
      return rules({ required: this.required, hours: true })
    },
    hint() {
      if (!this.value) return this.hintEmpty
      return formatHoursAndMinutes(this.value)
    }
  },
  watch: {
    tjsValue: {
      handler(newValue) {
        this.value = newValue
      },
      immediate: true
    }
  },
  methods: {
    update() {
      // round-trip to ensure formatted properly
      const b = fromHours(this.value)
      const s = toHours(b)
      this.$emit('update:tjsValue', s)
    }
  }
}
</script>
