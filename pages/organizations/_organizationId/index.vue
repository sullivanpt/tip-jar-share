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
              { text: 'permissions', value: 'manager' },
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
                      props.item.manager && 'edit',
                      props.item.linkedId === meId && 'me'
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
    </v-layout>
  </v-container>
</template>

<script>
import { buildGravatarUrl } from '~/helpers/gravatar'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsGravatarField from '~/components/tjs-gravatar-field'

/**
 * remove falsy values, then comma+space separate
 * see https://davidwalsh.name/javascript-tricks
 */
function arrayToCommaString(value) {
  if (!value) return
  return value.filter(Boolean).join(', ')
}

function organizationFindById(store, organizationId) {
  return store.state.organizations.organizations.find(
    org => organizationId.toString() === org.id.toString()
  )
}

function isOrganizationManager(meId, organization) {
  return organization.members.find(mbr => mbr.manager && mbr.linkedId === meId)
}

function meId(store) {
  return 1 // TODO: something useful
}

function meName(store) {
  return (store.state.auth.user && store.state.auth.user.name) || ''
}

const nuxtPageNotFound = {
  statusCode: 404,
  message: 'This page could not be found'
}

/**
 * TODO: long hints on this form are causing a need to hit submit twice
 */
export default {
  components: { TjsConfirmDelete, TjsGravatarField },
  filters: { arrayToCommaString },
  data: () => ({
    confirmDelete: false,
    search: null,
    organization: null,
    form: {
      name: null,
      gravatar: null
    }
  }),
  computed: {
    exists() {
      return !!this.organization
    },
    readonly() {
      return (
        this.exists &&
        !isOrganizationManager(meId(this.$store), this.organization)
      )
    },
    gravatarInvalid() {
      return !!this.form.gravatar && !buildGravatarUrl(this.form.gravatar)
    },
    formUnchanged() {
      const { name, gravatar } = this.organization || {}
      return this.form.name === name && this.form.gravatar === gravatar
    },
    formInvalid() {
      return !this.form.name || this.gravatarInvalid
    },
    meId() {
      return meId(this.$store)
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
      const { name, gravatar } = organization
      return {
        organization,
        form: { name, gravatar }
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
      const { name, gravatar } = this.form
      const avatar = buildGravatarUrl(gravatar) || null
      if (this.exists) {
        this.$store.commit('organizations/update', {
          id: this.organization.id,
          name,
          gravatar,
          avatar
        })
      } else {
        this.$store.commit('organizations/create', {
          managerId: meId(this.$store),
          managerName: meName(this.$store),
          name,
          gravatar,
          avatar
        })
        // TODO: redirect to new ID using dispatch
        const newId = this.$store.state.organizations.organizations.slice(-1)[0]
          .id
        this.$router.replace({ path: `/organizations/${newId}` })
      }
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
