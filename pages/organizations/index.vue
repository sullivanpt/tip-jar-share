<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex v-if="organizationOptions.length">
        <v-list two-line subheader>
          <v-list-tile
            v-for="item in organizationOptions"
            :key="item.value"
            :color="organizationSelected === item.value ? 'primary' : null"
            avatar
            @click="toOrganization(item)"
          >
            <tjs-avatar-tile :item="item" />
            <v-list-tile-content>
              <v-list-tile-title>{{ item.text }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>

      <v-flex>
        <tjs-organization-select v-if="!organizationOptions.length" />
        <tjs-organization-join v-else />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TjsOrganizationSelect from '~/components/tjs-organization-select.vue'
import TjsOrganizationJoin from '~/components/tjs-organization-join'
import TjsAvatarTile from '~/components/tjs-avatar-tile'

export default {
  components: {
    TjsAvatarTile,
    TjsOrganizationSelect,
    TjsOrganizationJoin
  },
  computed: {
    organizationSelected() {
      return this.$store.state.organizations.organizationSelected
    },
    organizationOptions() {
      return this.$store.getters['organizations/organizationOptions']
    }
  },
  methods: {
    toOrganization({ value }) {
      this.$store.commit('organizations/select', { organizationId: value })
      this.$router.push({ path: `/organizations/${value}` })
    }
  }
}
</script>
