<template>
  <v-select
    v-if="organizationOptions.length"
    v-model="organizationSelected"
    :items="organizationOptions"
    label="your active team"
    box
    chips
  >
    <template v-slot:selection="data">
      <v-chip>
        <v-avatar v-if="data.item.avatar">
          <img :src="data.item.avatar" />
        </v-avatar>
        {{ data.item.text }}
      </v-chip>
    </template>
    <template v-slot:item="data">
      <v-list-tile-avatar v-if="data.item.avatar">
        <img :src="data.item.avatar" />
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{ data.item.text }}</v-list-tile-title>
      </v-list-tile-content>
    </template>
  </v-select>

  <v-card v-else>
    <v-card-text>
      <p>
        Thank you for signing up. If you are joining an existing team you should
        enter the "team code" your manager gave you here.
      </p>
      <p>Or if you want to manage a new team you can create it now.</p>
    </v-card-text>
    <v-card-text>
      <v-text-field
        v-model="organizationTeamCode"
        label="enter your team code"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn :disabled="!!organizationTeamCode" to="/organizations/@new"
        >create a new team</v-btn
      >
      <v-btn
        :disabled="!organizationTeamCode"
        color="primary"
        @click="organizationJoin"
        >join</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
/**
 * shows the current organization and lets the user select a different one, or
 * add a new one if none exist.
 */
export default {
  data: () => ({
    organizationTeamCode: null
  }),
  computed: {
    organizationSelected: {
      get() {
        return this.$store.state.organizations.organizationSelected
      },
      set(organizationId) {
        return this.$store.commit('organizations/select', { organizationId })
      }
    },
    organizationOptions() {
      return this.$store.getters['organizations/organizationOptions']
    }
  },
  methods: {
    organizationJoin() {
      return this.$store.commit('organizations/join', {
        organizationTeamCode: this.organizationTeamCode
      })
    }
  }
}
</script>
