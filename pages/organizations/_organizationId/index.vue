<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-confirm-delete
          :show="confirmDelete"
          @cancel="confirmDelete = false"
          @confirm="
            confirmDelete = false
            deleteOrganization()
          "
        >
          Please enter the digits 1234 to confirm you want to permanently delete
          this team and all its data. Please read the
          <nuxt-link to="/docs/policies">Privacy Policy</nuxt-link>
          for details and exceptions.
        </tjs-confirm-delete>

        <!-- TODO: occassionally warn changes here only affect future reports -->
        <v-form v-model="valid">
          <v-card>
            <v-card-text>
              <tjs-text-field
                v-model="form.name"
                :readonly="readonly"
                required
                label="team name"
                hint="store name if you share by day or shift name if you share by shift, example: Lunch crew at Tavern #2"
              />
              <tjs-gravatar-field
                v-model="form.gravatar"
                :avatar="organizationAvatar.avatar"
                :gravatar-masked="organizationAvatar.gravatarMasked"
                :name="form.name"
                :readonly="readonly"
                label="team logo"
                hint="a unique image for your team. enter an email you registered with gravatar.com."
              />
              <tjs-time-picker
                v-model="form.timeOpen"
                :readonly="readonly"
                required
                label="daily opening time"
                hint="determines date of each report"
              />
              <tjs-time-picker
                v-model="form.timeClose"
                :readonly="readonly"
                required
                label="daily closing time"
                hint="determines end of each report"
              />
              <tjs-text-field
                v-model="form.timeZone"
                readonly
                required
                label="team time zone"
                prepend-icon="language"
              />
              <v-select
                :value="90"
                :items="[{ text: '3 months', value: 90 }]"
                label="delete reports after"
                readonly
              />
            </v-card-text>
            <v-card-actions v-if="!readonly">
              <v-btn
                v-if="exists"
                :disabled="loading"
                :loading="loading"
                flat
                @click="refresh"
              >
                <v-icon class="hidden-xs-only">refresh</v-icon>
                <div class="caption font-italic" v-text="organizationVersion" />
              </v-btn>
              <v-spacer />
              <v-btn
                v-if="exists && !readonly"
                flat
                @click="confirmDelete = true"
              >
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
      </v-flex>

      <v-flex v-if="exists">
        <tjs-members
          :members="members"
          :me-id="meId"
          :readonly="readonly"
          @row:add="editMember('@new')"
          @row:edit="editMember"
        />
      </v-flex>

      <v-flex v-if="exists">
        <tjs-stations
          :stations="stations"
          :readonly="readonly"
          @row:add="editStation('@new')"
          @row:edit="editStation"
        />
      </v-flex>

      <!-- TODO: UI to clone formula if it doesn't exist, or select new formula from library -->
      <v-flex v-if="exists && formula">
        <tjs-formula
          :formula="formula"
          :readonly="readonly"
          @row:add="editAllocation('@new')"
          @row:edit="editAllocation"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { getBrowserTimeZone } from '~/helpers/browser'
import {
  hasOrganizationEdit,
  organizationFindById,
  organizationGetVersion
} from '~/helpers/organizations'
import { formulaFindById } from '~/helpers/formulas'
import { formUnchanged, formUpdate, vmAsCtx } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsFormula from '~/components/tjs-formula'
import TjsGravatarField from '~/components/tjs-gravatar-field'
import TjsMembers from '~/components/tjs-members'
import TjsStations from '~/components/tjs-stations'
import TjsTextField from '~/components/tjs-text-field'
import TjsTimePicker from '~/components/tjs-time-picker'

function meName(store) {
  return (store.state.auth.user && store.state.auth.user.name) || ''
}

function stateFromParams({ params, store }) {
  let organization = null
  let formula = null
  if (params.organizationId !== '@new') {
    organization = organizationFindById(store, params.organizationId)
    if (!organization) return
    formula = formulaFindById(store, organization.formulaId) || null
    if (organization.formulaId && !formula) return
  }
  return { organization, formula }
}

/**
 * TODO: long hints on this form are causing a need to hit submit twice
 */
export default {
  components: {
    TjsConfirmDelete,
    TjsFormula,
    TjsGravatarField,
    TjsMembers,
    TjsStations,
    TjsTextField,
    TjsTimePicker
  },
  mixins: [loading],
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  data() {
    const { organization } = stateFromParams(vmAsCtx(this))
    const organizationClone = organization
      ? Object.assign({ gravatar: organization.gravatarMasked }, organization)
      : null
    return {
      confirmDelete: false,
      valid: true,
      form: formUpdate(
        {
          name: null,
          gravatar: null,
          timeOpen: '11:00',
          timeClose: '02:00', // 2 AM next day
          timeZone: getBrowserTimeZone() // currently must compute this browser side
        },
        organizationClone
      )
    }
  },
  computed: {
    organization() {
      return stateFromParams(vmAsCtx(this)).organization
    },
    formula() {
      return stateFromParams(vmAsCtx(this)).formula // can be null
    },
    exists() {
      return !!this.organization
    },
    organizationVersion() {
      return this.exists ? organizationGetVersion(this.organization) : null
    },
    organizationAvatar() {
      if (this.exists) {
        return {
          avatar: this.organization.avatar,
          gravatarMasked: this.organization.gravatarMasked
        }
      } else {
        return {
          // TODO: not sure we need empty strings here
          avatar: '',
          gravatarMasked: ''
        }
      }
    },
    readonly() {
      return (
        this.exists &&
        !hasOrganizationEdit(this.$store.state.me.id, this.organization)
      )
    },
    formUnchanged() {
      return formUnchanged(
        this.form,
        Object.assign(
          { gravatar: this.organizationAvatar.gravatarMasked },
          this.organization
        )
      )
    },
    meId() {
      return this.$store.state.me.id
    },
    stations() {
      return this.exists ? this.organization.stations : []
    },
    members() {
      return this.exists ? this.organization.members : []
    }
  },
  methods: {
    async refresh() {
      try {
        await this.$store.dispatch('refresh')
      } catch (e) {}
    },
    async deleteOrganization() {
      try {
        await this.$store.dispatch('organizations/delete', {
          organizationId: this.organization.id
        })
        this.$router.push({ path: `/organizations` })
      } catch (e) {}
    },
    async submit() {
      try {
        const { name, gravatar, timeOpen, timeClose, timeZone } = this.form
        if (this.exists) {
          this.$store.dispatch('organizations/update', {
            organizationId: this.organization.id,
            name,
            gravatar,
            timeOpen,
            timeClose,
            timeZone
          })
        } else {
          const organizationId = await this.$store.dispatch(
            'organizations/create',
            {
              meName: meName(this.$store),
              name,
              gravatar,
              timeOpen,
              timeClose,
              timeZone
            }
          )
          // redirect to the URL of the new object
          this.$store.dispatch('me/selectedOrganizationId', {
            organizationId
          })
          this.$router.replace({ path: `/organizations/${organizationId}` })
        }
      } catch (e) {}
    },
    editStation(stationId) {
      this.$router.push({
        path: `/organizations/${this.organization.id}/stations/${stationId}`
      })
    },
    editMember(memberId) {
      this.$router.push({
        path: `/organizations/${this.organization.id}/members/${memberId}`
      })
    },
    editAllocation(allocationId) {
      this.$router.push({
        path: `/formulas/${this.formula.id}/allocations/${allocationId}`
      })
    }
  }
}
</script>
