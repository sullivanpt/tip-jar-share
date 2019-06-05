<template>
  <v-form v-model="valid">
    <tjs-confirm-delete
      :show="confirmDelete"
      @cancel="confirmDelete = false"
      @confirm="
        confirmDelete = false
        deleteAllocation()
      "
    >
      Please enter the digits 1234 to confirm you want to permanently delete
      this position from future reports. Members currently assigned to this
      position will not participate in future pools.
    </tjs-confirm-delete>

    <v-card>
      <v-card-text>
        <tjs-text-field
          v-model="form.position"
          :readonly="readonly"
          :unique="otherPositions"
          required
          label="position"
          hint="a team role such as bartender or waitress"
          prepend-icon="person_pin_circle"
        />
      </v-card-text>

      <v-expansion-panel v-model="panel" expand>
        <v-expansion-panel-content>
          <template v-slot:header
            ><div :class="{ 'empty-step': emptySteps.enter }">
              <b>step 1:</b> enter values
            </div></template
          >
          <v-card-text>
            <v-list two-line>
              <tjs-list-tile-checkbox
                v-for="fld in reporterFields"
                :key="fld.enable"
                v-model="form[fld.enable]"
                :readonly="readonly"
                :label="fld.text"
                :hint="fld.hint"
              />
            </v-list>
          </v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div :class="{ 'empty-step': emptySteps.contribute }">
              <b>step 2:</b> pool contributions
            </div></template
          >
          <v-card-text>
            <tjs-text-percent
              v-model="form.contributeSalesNetPercent"
              :readonly="readonly"
              label="% of net sales"
              hint="give a percentage of member's gross minus excluded sales"
            />
            <tjs-text-percent
              v-model="form.contributeTipsPosPercent"
              :readonly="readonly"
              label="% of CC and POS tips"
              hint="give a percentage of member's tips from credit card and point of sales"
            />
            <tjs-text-percent
              v-model="form.contributeTipsCashPercent"
              :readonly="readonly"
              label="% of cash tips"
              hint="give a percentage of member's tips from cash"
            />
            <div class="caption text-truncate muted">
              * tip cash jars contribute to the position's cash tip pool
            </div>
          </v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div :class="{ 'empty-step': emptySteps.transferA }">
              <b>step 3:</b> share with other positions
            </div></template
          >
          <v-card-text>
            <tjs-allocation-transfers
              v-model="form.transfers[0]"
              :other-position-options="otherPositionOptions"
              :readonly="readonly"
            />
          </v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div :class="{ 'empty-step': emptySteps.transferB }">
              <b>step 4:</b> share what's shared
            </div></template
          >
          <v-card-text>
            <tjs-allocation-transfers
              v-model="form.transfers[1]"
              :other-position-options="otherPositionOptions"
              :readonly="readonly"
            />
          </v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div :class="{ 'empty-step': emptySteps.distribute }">
              <b>step 5:</b> distribute remaining pool
            </div></template
          >
          <v-card-text>
            <v-select
              v-model="form.distributeBy"
              :items="[
                {
                  text: 'hours worked',
                  value: 'distributeByHours'
                },
                {
                  text: 'net sales',
                  value: 'distributeBySalesNet'
                }
              ]"
              :readonly="readonly"
              required
              label="distribute by"
              hint="share of remaining pooled tips to each position member"
            />
          </v-card-text>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn v-if="exists && !readonly" flat @click="confirmDelete = true">
          <v-icon>delete</v-icon>
        </v-btn>
        <v-btn
          :disabled="loading || formUnchanged || !valid"
          :loading="loading"
          type="submit"
          @click.prevent="submit"
          >submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { cloneDeep, deepEqual } from '~/helpers/nodash'
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import {
  allocationEmptySteps,
  defaultTransfersState,
  formulaFindById,
  reporterFields
} from '~/helpers/formulas'
import { formUnchanged, formUpdate, vmAsCtx } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsAllocationTransfers from '~/components/tjs-allocation-transfers'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsListTileCheckbox from '~/components/tjs-list-tile-checkbox'
import TjsTextField from '~/components/tjs-text-field'
import TjsTextPercent from '~/components/tjs-text-percent'

function allocationFindById(formula, allocationId) {
  return formula.allocations.find(
    alc => allocationId.toString() === alc.id.toString()
  )
}

function stateFromParams({ params, store }, mightDelete) {
  const formula = formulaFindById(store, params.formulaId)
  if (!formula) return
  const organization =
    organizationFindById(store, formula.organizationId) || null
  if (formula.organizationId && !organization) return
  let allocation = null
  if (params.allocationId !== '@new') {
    allocation = allocationFindById(formula, params.allocationId)
    if (mightDelete && !allocation) allocation = null
    else if (!allocation) return
  }
  return { formula, organization, allocation }
}

export default {
  components: {
    TjsAllocationTransfers,
    TjsConfirmDelete,
    TjsListTileCheckbox,
    TjsTextField,
    TjsTextPercent
  },
  mixins: [loading],
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  data() {
    const { allocation } = stateFromParams(vmAsCtx(this))
    const allocationClone = allocation ? cloneDeep(allocation) : null // for transfers
    return {
      reporterFields,
      confirmDelete: false,
      panel: [],
      valid: true,
      form: formUpdate(
        {
          position: null,
          hoursShow: true,
          salesTotalShow: true,
          salesExcludedShow: true,
          tipsPosShow: true,
          tipsCashShow: true,
          contributeSalesNetPercent: null,
          contributeTipsPosPercent: null,
          contributeTipsCashPercent: null,
          transfers: defaultTransfersState(),
          distributeBy: 'distributeByHours'
        },
        allocationClone
      )
    }
  },
  computed: {
    organization() {
      return stateFromParams(vmAsCtx(this), true).organization // can be null if shared
    },
    formula() {
      return stateFromParams(vmAsCtx(this), true).formula
    },
    allocation() {
      return stateFromParams(vmAsCtx(this), true).allocation
    },
    exists() {
      return !!this.allocation
    },
    readonly() {
      return (
        !!this.formula.reportId ||
        !this.organization ||
        !hasOrganizationEdit(this.$store.state.me.id, this.organization)
      )
    },
    formUnchanged() {
      return (
        formUnchanged(this.form, this.allocation, ['transfers']) &&
        deepEqual(this.form.transfers, this.allocation.transfers)
      )
    },
    otherPositionOptions() {
      return this.formula.allocations
        .filter(alc => !this.allocation || alc.id !== this.allocation.id)
        .map(alc => ({ text: alc.position, value: alc.id }))
    },
    otherPositions() {
      return this.otherPositionOptions.map(opt => opt.text)
    },
    emptySteps() {
      return allocationEmptySteps(this.form)
    }
  },
  methods: {
    async deleteAllocation() {
      await this.$store.dispatch('formulas/allocationDelete', {
        formulaId: this.formula.id,
        allocationId: this.allocation.id
      })
      this.$router.go(-1)
    },
    async submit() {
      try {
        const attrs = Object.assign({}, this.form) // warning: shallow copy of transfers
        if (this.exists) {
          this.$store.dispatch('formulas/allocationUpdate', {
            formulaId: this.formula.id,
            allocationId: this.allocation.id,
            ...attrs
          })
        } else {
          const allocationId = await this.$store.dispatch(
            'formulas/allocationCreate',
            {
              formulaId: this.formula.id,
              ...attrs
            }
          )
          this.$router.replace({
            path: `/formulas/${this.formula.id}/allocations/${allocationId}`
          })
        }
      } catch (e) {}
    }
  }
}
</script>

<style>
.muted {
  color: #bbb; /* TODO: compute this color */
}
.empty-step {
  font-style: italic;
}
</style>
