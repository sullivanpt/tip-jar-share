<template>
  <tjs-organization-select v-if="!organizationOptions.length" />
  <v-list v-else two-line subheader>
    <v-list-tile
      v-for="item in organizationOptions"
      :key="item.value"
      :color="organizationSelected === item.value ? 'primary' : null"
      :to="`/organizations/${item.value}`"
      avatar
    >
      <v-list-tile-avatar color="grey">
        <img v-if="item.avatar" :src="item.avatar" />
        <span v-else class="white--text headline">{{ item.text[0] }}</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{ item.text }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-content>
        <v-btn to="/organizations-join">join another team</v-btn>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
import TjsOrganizationSelect from '~/components/tjs-organization-select.vue'

export default {
  components: {
    TjsOrganizationSelect
  },
  computed: {
    organizationSelected() {
      return this.$store.state.organizations.organizationSelected
    },
    organizationOptions() {
      return this.$store.getters['organizations/organizationOptions']
    }
  }
}
</script>
