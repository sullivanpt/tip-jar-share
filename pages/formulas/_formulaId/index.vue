<template>
  <tjs-formula :formula="formula" readonly @row:edit="editAllocation" />
</template>

<script>
import { organizationFindById } from '~/helpers/organizations'
import { formulaFindById } from '~/helpers/formulas'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import TjsFormula from '~/components/tjs-formula'

export default {
  components: { TjsFormula },
  data: () => ({
    formula: null,
    allocation: null,
    organization: null // can be null if shared
  }),
  asyncData({ error, params, store }) {
    const formula = formulaFindById(store, params.formulaId)
    if (!formula) {
      return error(nuxtPageNotFound)
    }
    const organization =
      organizationFindById(store, formula.organizationId) || null
    if (formula.organizationId && !organization) {
      return error(nuxtPageNotFound)
    }
    return { formula, organization }
  },
  methods: {
    editAllocation(allocationId) {
      this.$router.push({
        path: `/formulas/${this.formula.id}/allocations/${allocationId}`
      })
    }
  }
}
</script>
