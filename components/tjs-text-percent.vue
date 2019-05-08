<template>
  <v-text-field
    v-model="value"
    :rules="rules"
    type="tel"
    suffix="%"
    v-bind="$attrs"
    v-on="$listeners"
    @change="update"
  />
</template>

<script>
import { fromPercent, toPercent } from '~/helpers/math'
import { rules } from '~/helpers/form-validation'

/**
 * currency input with string as base type
 */
export default {
  model: { prop: 'tjsValue', event: 'update:tjsValue' },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    tjsValue: { default: '' },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  data: () => ({
    value: null
  }),
  computed: {
    rules() {
      return rules({ required: this.required, percent: true })
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
      /* eslint-disable */
      const b = fromPercent(this.value)
      const s = toPercent(b)
      console.log('B', b, s)
      this.$emit('update:tjsValue', s)
    }
  }
}
</script>
