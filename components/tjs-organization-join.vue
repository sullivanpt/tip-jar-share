<template>
  <v-card>
    <v-card-text>
      <slot>Join a another existing team or create another new team.</slot>
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
export default {
  data: () => ({
    organizationTeamCode: null
  }),
  methods: {
    organizationJoin() {
      return this.$store.commit('organizations/join', {
        organizationTeamCode: this.organizationTeamCode
      })
    }
  }
}
</script>
