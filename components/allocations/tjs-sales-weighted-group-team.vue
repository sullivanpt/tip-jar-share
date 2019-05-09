<template>
  <v-form v-model="valid">
    <v-card>
      <v-card-title class="headline">allocation settings</v-card-title>
      <v-card-text>
        <v-select
          v-model="form.name"
          :items="teamRuleNameOptions"
          :readonly="readonly"
          required
          label="rule name"
        />
        <tjs-text-percent
          v-model="form.serverSalesPercenToBarTip"
          :readonly="readonly"
          required
          label="server to bar tip % of sales"
        />
        <tjs-text-percent
          v-model="form.bartenderTipPercentToBarBackTip"
          :readonly="readonly"
          required
          label="bartender to bar back % of tip"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="formUnchanged || !valid"
          type="submit"
          @click.prevent="submit"
          >submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { teamRuleNameOptions } from '~/helpers/allocations/sales-weighted-group'
import { formUnchanged, updateForm } from '~/helpers/form-validation'
import TjsTextPercent from '~/components/tjs-text-percent'

/**
 * one of many forms for editing the team rule parameters
 * note: rule.name is also included, but changing it changes the rule
 */
export default {
  components: { TjsTextPercent },
  props: {
    rule: { type: Object, default: () => ({}) },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({
    valid: true,
    form: {
      name: null,
      serverSalesPercenToBarTip: null,
      bartenderTipPercentToBarBackTip: null
    },
    teamRuleNameOptions
  }),
  computed: {
    formUnchanged() {
      return formUnchanged(this.form, this.rule)
    }
  },
  watch: {
    rule: {
      handler: function(newValue) {
        updateForm(this.form, newValue)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    submit() {
      const newRule = Object.assign({}, this.form)
      this.$emit('submit', newRule)
    }
  }
}
</script>
