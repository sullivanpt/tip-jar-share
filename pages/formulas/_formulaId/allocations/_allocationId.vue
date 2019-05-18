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
        />
      </v-card-text>

      <v-expansion-panel v-model="panel" expand>
        <v-expansion-panel-content>
          <template v-slot:header
            ><div>reported fields</div></template
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
            ><div>contributions</div></template
          >
          <v-card-text>coming soon</v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div>step 1</div></template
          >
          <v-card-text>coming soon</v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div>step 2</div></template
          >
          <v-card-text>coming soon</v-card-text>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <template v-slot:header
            ><div>distribution</div></template
          >
          <v-card-text>
            <v-select
              value="distributeBySalesTotal"
              :items="[
                {
                  text: 'percentage of gross sales',
                  value: 'distributeBySalesTotal'
                }
              ]"
              label="distribute by"
              hint="share of remaining pooled tips for each position member"
              readonly
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
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import { formulaFindById, reporterFields } from '~/helpers/formulas'
import { formUnchanged } from '~/helpers/form-validation'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsListTileCheckbox from '~/components/tjs-list-tile-checkbox'
import TjsTextField from '~/components/tjs-text-field'

function allocationFindById(formula, allocationId) {
  return formula.allocations.find(
    alc => allocationId.toString() === alc.id.toString()
  )
}

export default {
  components: { TjsConfirmDelete, TjsListTileCheckbox, TjsTextField },
  data: () => ({
    confirmDelete: false,
    panel: [false, true, true, false, false],
    formula: null,
    allocation: null,
    organization: null, // can be null if shared
    valid: true,
    form: {
      position: null,
      hoursShow: true,
      salesTotalShow: true,
      salesExcludedShow: true,
      tipsPosShow: true,
      tipsCashShow: true
    },
    reporterFields
  }),
  computed: {
    exists() {
      return !!this.allocation
    },
    readonly() {
      return (
        !this.organization ||
        !hasOrganizationEdit(this.$store.state.me.id, this.organization)
      )
    },
    formUnchanged() {
      return formUnchanged(this.form, this.allocation)
    },
    otherPositions() {
      return this.formula.allocations
        .filter(alc => !this.allocation || alc.id !== this.allocation.id)
        .map(alc => alc.position)
    }
  },
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
    if (params.allocationId !== '@new') {
      const allocation = allocationFindById(formula, params.allocationId)
      if (!allocation) {
        return error(nuxtPageNotFound)
      }
      const {
        position,
        hoursShow,
        salesTotalShow,
        salesExcludedShow,
        tipsPosShow,
        tipsCashShow
      } = allocation
      return {
        formula,
        allocation,
        organization,
        form: {
          position,
          hoursShow,
          salesTotalShow,
          salesExcludedShow,
          tipsPosShow,
          tipsCashShow
        }
      }
    }
    return { formula, organization }
  },
  methods: {
    deleteAllocation() {
      this.$store.commit('formulas/allocationDelete', {
        formulaId: this.formula.id,
        id: this.allocation.id
      })
      this.$router.go(-1) // this.$router.push({ path: `/formulas/${this.formula.id}` })
    },
    submit() {
      const attrs = Object.assign({}, this.form)
      if (this.exists) {
        this.$store.commit('formulas/allocationUpdate', {
          formulaId: this.formula.id,
          id: this.allocation.id,
          ...attrs
        })
      } else {
        this.$store.commit('formulas/allocationCreate', {
          formulaId: this.formula.id,
          ...attrs
        })
        // TODO: redirect to new ID using dispatch
        const newId = this.formula.allocations.slice(-1)[0].id
        this.$router.replace({
          path: `/formulas/${this.formula.id}/allocations/${newId}`
        })
      }
    }
  }
}
</script>
