<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex v-if="organizationOptions.length">
        <v-list two-line subheader>
          <v-list-tile
            v-for="item in organizationOptions"
            :key="item.value"
            :class="{ 'primary--text': selectedOrganizationId === item.value }"
            avatar
            @click="toOrganization(item)"
          >
            <tjs-avatar-tile :item="item" />
            <v-list-tile-content>
              <v-list-tile-title>{{ item.text }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn>setup</v-btn>
            </v-list-tile-action>
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
    selectedOrganizationId() {
      return this.$store.state.me.selectedOrganizationId
    },
    organizationOptions() {
      return this.$store.getters['organizations/organizationOptions']
    }
  },
  methods: {
    toOrganization({ value: organizationId }) {
      if (this.selectedOrganizationId !== organizationId) {
        this.$store.dispatch('me/selectedOrganizationId', {
          organizationId
        })
      }
      this.$router.push({ path: `/organizations/${organizationId}` })
    }
  }
}
</script>
