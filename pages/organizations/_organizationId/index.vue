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
        <v-form>
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="form.name"
                label="team name"
                hint="store name if you share by day or shift name if you share by shift, example: Lunch crew at Tavern #2"
                :readonly="readonly"
              />
              <tjs-gravatar-field
                v-model="form.gravatar"
                :avatar="exists ? organization.avatar : ''"
                :gravatar-masked="exists ? organization.gravatar : ''"
                :name="form.name"
                label="team gravatar"
                hint="a unique image for your team. enter the email you registered with gravatar.com."
                :readonly="readonly"
              />
              <tjs-time-picker
                v-model="form.timeOpen"
                label="daily opening time"
                hint="determines date of each report"
                :readonly="readonly"
              />
              <tjs-time-picker
                v-model="form.timeClose"
                label="daily closing time"
                hint="determines end of each report"
                :readonly="readonly"
              />
              <v-text-field
                v-model="form.timeZone"
                label="team time zone"
                prepend-icon="language"
                readonly
              />
              <v-select
                :value="90"
                :items="[{ text: '3 months', value: 90 }]"
                label="delete reports after"
                readonly
              />
            </v-card-text>
            <v-card-actions v-if="!readonly">
              <v-spacer />
              <v-btn
                v-if="exists && !readonly"
                flat
                @click="confirmDelete = true"
              >
                <v-icon>delete</v-icon>
              </v-btn>
              <v-btn
                :disabled="formInvalid || formUnchanged"
                type="submit"
                @click.prevent="submit"
                >submit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-form>
      </v-flex>

      <v-flex v-if="exists">
        <tjs-stations
          :stations="stations"
          :readonly="readonly"
          @row:add="editStation('@new')"
          @row:edit="editStation"
        />
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
        <tjs-positions
          :positions="positions"
          :readonly="readonly"
          @row:add="editPosition('@new')"
          @row:edit="editPosition"
        />
      </v-flex>

      <v-flex v-if="exists">
        <tjs-sales-weighted-group-team
          :rule="organization.rule"
          :readonly="readonly"
          @submit="submitRule"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { getBrowserTimeZone } from '~/helpers/browser'
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsGravatarField from '~/components/tjs-gravatar-field'
import TjsMembers from '~/components/tjs-members'
import TjsPositions from '~/components/tjs-positions'
import TjsSalesWeightedGroupTeam from '~/components/allocations/tjs-sales-weighted-group-team'
import TjsStations from '~/components/tjs-stations'
import TjsTimePicker from '~/components/tjs-time-picker'

function meName(store) {
  return (store.state.auth.user && store.state.auth.user.name) || ''
}

/**
 * TODO: long hints on this form are causing a need to hit submit twice
 */
export default {
  components: {
    TjsConfirmDelete,
    TjsGravatarField,
    TjsMembers,
    TjsPositions,
    TjsSalesWeightedGroupTeam,
    TjsStations,
    TjsTimePicker
  },
  data: () => ({
    confirmDelete: false,
    organization: null,
    form: {
      name: null,
      gravatar: null,
      timeOpen: '11:00',
      timeClose: '02:00', // 2 AM next day
      timeZone: getBrowserTimeZone() // currently must compute this browser side
    }
  }),
  computed: {
    exists() {
      return !!this.organization
    },
    readonly() {
      return (
        this.exists &&
        !hasOrganizationEdit(this.$store.state.me.id, this.organization)
      )
    },
    formUnchanged() {
      const { name, gravatarMasked: gravatar, timeOpen, timeClose, timeZone } =
        this.organization || {}
      return (
        this.form.name === name &&
        this.form.gravatar === gravatar &&
        this.form.timeOpen === timeOpen &&
        this.form.timeClose === timeClose &&
        this.form.timeZone === timeZone
      )
    },
    formInvalid() {
      return (
        !this.form.name ||
        // this.gravatarInvalid ||
        !this.form.timeOpen ||
        !this.form.timeClose ||
        !this.form.timeZone
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
    },
    positions() {
      return this.exists ? this.organization.positions : []
    }
  },
  asyncData({ error, params, store }) {
    if (params.organizationId !== '@new') {
      // TODO: await store.dispatch('organizations/load')
      const organization = organizationFindById(store, params.organizationId)
      if (!organization) {
        return error(nuxtPageNotFound)
      }
      const { name, gravatar, timeOpen, timeClose, timeZone } = organization
      return {
        organization,
        form: { name, gravatar, timeOpen, timeClose, timeZone }
      }
    }
    return {}
  },
  methods: {
    deleteOrganization() {
      this.$store.commit('organizations/delete', { id: this.organization.id })
      this.$router.push({ path: `/organizations` })
    },
    submit() {
      const { name, gravatar, timeOpen, timeClose, timeZone } = this.form
      if (this.exists) {
        this.$store.commit('organizations/update', {
          id: this.organization.id,
          name,
          gravatar,
          timeOpen,
          timeClose,
          timeZone
        })
      } else {
        this.$store.commit('organizations/create', {
          meId: this.$store.state.me.id,
          meName: meName(this.$store),
          name,
          gravatar,
          timeOpen,
          timeClose,
          timeZone
        })
        // redirect to the URL of the new object
        const newId = this.$store.getters['organizations/lastId']
        this.$store.dispatch('me/selectedOrganizationId', {
          organizationId: newId
        })
        this.$router.replace({ path: `/organizations/${newId}` })
      }
    },
    submitRule(rule) {
      // note: because we were not careful in asyncFetch this.organization is vuex object
      this.$store.commit('organizations/update', {
        id: this.organization.id,
        rule
      })
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
    editPosition(positionId) {
      this.$router.push({
        path: `/organizations/${this.organization.id}/positions/${positionId}`
      })
    }
  }
}
</script>
