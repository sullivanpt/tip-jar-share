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
        <v-card>
          <v-card-title>
            <span class="headline">staff members</span>
            <v-spacer />
            <v-btn
              v-if="!readonly"
              title="add"
              fab
              small
              color="primary"
              @click="editMember('@new')"
            >
              <v-icon>add</v-icon>
            </v-btn>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
              clearable
            />
          </v-card-title>
          <v-data-table
            :headers="[
              { text: 'nick name', value: 'name' },
              { text: 'position', value: 'position' },
              { text: 'permissions', value: 'edit' }, // TODO: search/sort on computed field here
              { text: 'team code', value: 'code' }
            ]"
            :items="members"
            :search="search"
          >
            <template v-slot:items="props">
              <tr
                :active="props.item.linkedId === meId"
                @click="editMember(props.item.id)"
              >
                <td>{{ props.item.name }}</td>
                <td>{{ props.item.position }}</td>
                <td>
                  {{
                    [
                      props.item.edit && 'edit',
                      props.item.linkedId === meId && 'me',
                      props.item.away && 'away'
                    ] | arrayToCommaString
                  }}
                </td>
                <td>
                  <span v-if="!readonly" v-text="props.item.code"></span>
                  <v-icon v-else-if="props.item.code">visibility</v-icon>
                  <v-icon v-if="props.item.linkedId">link</v-icon>
                </td>
              </tr>
            </template>
            <template v-slot:footer>
              <td :colspan="4">
                <v-switch
                  v-model="showAway"
                  label="show away and retired members"
                  hide-details
                />
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>

      <v-flex v-if="exists">
        <v-card>
          <v-card-title>
            <span class="headline">staff positions</span>
            <v-spacer />
            <v-btn
              v-if="!readonly"
              title="add"
              fab
              small
              color="primary"
              @click="editPosition('@new')"
            >
              <v-icon>add</v-icon>
            </v-btn>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
              clearable
            />
          </v-card-title>
          <v-data-table
            :headers="[
              { text: 'position', value: 'name' },
              { text: 'allocation rule', value: 'rule' }
            ]"
            :items="positions"
            :search="search"
          >
            <template v-slot:items="props">
              <tr @click="editPosition(props.item.id)">
                <td>{{ props.item.name }}</td>
                <td>{{ props.item.rule }}</td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
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
import { buildGravatarUrl } from '~/helpers/gravatar'
import { getBrowserTimeZone } from '~/helpers/browser'
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsGravatarField from '~/components/tjs-gravatar-field'
import TjsSalesWeightedGroupTeam from '~/components/allocations/tjs-sales-weighted-group-team'
import TjsTimePicker from '~/components/tjs-time-picker'

/**
 * remove falsy values, then comma+space separate
 * see https://davidwalsh.name/javascript-tricks
 */
function arrayToCommaString(value) {
  if (!value) return
  return value.filter(Boolean).join(', ')
}

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
    TjsSalesWeightedGroupTeam,
    TjsTimePicker
  },
  filters: { arrayToCommaString },
  data: () => ({
    confirmDelete: false,
    search: null,
    showAway: false,
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
    gravatarInvalid() {
      return !!this.form.gravatar && !buildGravatarUrl(this.form.gravatar)
    },
    formUnchanged() {
      const { name, gravatar, timeOpen, timeClose, timeZone } =
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
        this.gravatarInvalid ||
        !this.form.timeOpen ||
        !this.form.timeClose ||
        !this.form.timeZone
      )
    },
    meId() {
      return this.$store.state.me.id
    },
    members() {
      let members = this.exists ? this.organization.members : []
      if (!this.showAway) members = members.filter(mbr => !mbr.away)
      return members
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
      const avatar = buildGravatarUrl(gravatar) || null
      if (this.exists) {
        this.$store.commit('organizations/update', {
          id: this.organization.id,
          name,
          gravatar,
          avatar,
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
          avatar,
          timeOpen,
          timeClose,
          timeZone
        })
        // redirect to the URL of the new object
        const newId = this.$store.getters['organizations/lastId']
        this.$store.commit('me/organizationSelected', { organizationId: newId })
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
