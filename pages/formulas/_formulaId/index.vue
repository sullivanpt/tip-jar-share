<template>
  <tjs-formula :formula="formula" readonly @row:edit="editAllocation" />
</template>

<script>
import { organizationFindById } from '~/helpers/organizations'
import { formulaFindById } from '~/helpers/formulas'
import { vmAsCtx } from '~/helpers/form-validation'
import TjsFormula from '~/components/tjs-formula'

function stateFromParams({ params, store }) {
  const formula = formulaFindById(store, params.formulaId)
  if (!formula) return
  const organization =
    organizationFindById(store, formula.organizationId) || null
  if (formula.organizationId && !organization) return
  return { formula, organization }
}

export default {
  components: { TjsFormula },
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  computed: {
    organization() {
      return stateFromParams(vmAsCtx(this)).organization // can be null if shared
    },
    formula() {
      return stateFromParams(vmAsCtx(this)).formula
    }
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
