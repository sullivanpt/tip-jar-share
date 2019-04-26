<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <v-card>
          <v-card-text>
            <v-text-field
              v-model="form.name"
              label="team name"
              :readonly="readonly"
            />
            <v-text-field
              v-model="form.avatar"
              label="avatar URL"
              :readonly="readonly"
            />
          </v-card-text>
          <v-card-actions v-if="!readonly">
            <v-btn :disabled="formInvalid" @click="submit">submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex v-if="exists">
        <v-card>
          <v-card-title>
            <span class="headline">staff members</span>
            <v-spacer />
            <v-btn title="add" fab small color="primary">
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
              { text: 'join code', value: 'code' }
            ]"
            :items="members"
            :search="search"
          >
            <template v-slot:items="props">
              <tr @click="editMember(props.item)">
                <td>{{ props.item.name }}</td>
                <td>{{ props.item.position }}</td>
                <td>{{ props.item.manager ? 'manager' : '' }}</td>
                <td>
                  {{ props.item.code
                  }}<v-icon v-if="props.item.linkedId">link</v-icon>
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
            <v-btn title="add" fab small color="primary">
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
              <tr @click="editPosition(props.item)">
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
function organizationSelected(store) {
  return store.state.organizations.organizations.find(
    org => org.id === store.state.organizations.organizationSelected
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

export default {
  data: () => ({
    search: null,
    organization: null,
    form: {
      name: null,
      avatar: null
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
    formInvalid() {
      return !this.form.name
    },
    members() {
      return this.exists ? this.organization.members : []
    },
    positions() {
      return this.exists ? this.organization.positions : []
    }
  },
  asyncData({ params, store }) {
    if (params.organizationId !== '@new') {
      // TODO: await store.dispatch('organizations/load')
      // TODO: search by parseInt(params.organizationId)
      const organization = organizationSelected(store)
      if (organization) {
        const { name, avatar } = organization
        return {
          organization,
          form: { name, avatar }
        }
      }
    }
    return {}
  },
  methods: {
    submit() {
      const { name, avatar } = this.form
      if (this.exists) {
        this.$store.commit('organizations/update', {
          id: this.organization.id,
          name,
          avatar
        })
      } else {
        this.$store.commit('organizations/create', {
          managerId: meId(this.$store),
          managerName: meName(this.$store),
          name,
          avatar
        })
        // TODO: redirect to new ID using dispatch
        const newOrgId = this.$store.state.organizations.organizations.slice(
          -1
        )[0].id
        this.$router.replace({ path: `/organizations/${newOrgId}` })
      }
    },
    editMember(item) {
      // TODO: navigate to member details
    },
    editPosition(item) {
      // TODO: navigate to position details
    }
  }
}
</script>
