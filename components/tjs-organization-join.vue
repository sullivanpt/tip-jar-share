<template>
  <v-form>
    <v-card>
      <v-card-text>
        <slot>Join a another existing team or create another new team.</slot>
      </v-card-text>
      <v-card-text>
        <v-text-field
          v-model="organizationMemberCode"
          label="enter your team code"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="!!organizationMemberCode" @click="organizationCreate"
          >create a new team</v-btn
        >
        <v-btn
          :disabled="!organizationMemberCode"
          color="primary"
          type="submit"
          @click.prevent="organizationJoin"
          >join</v-btn
        >
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar" color="error"
      >incorrect team code</v-snackbar
    >
  </v-form>
</template>

<script>
export default {
  data: () => ({
    snackbar: false,
    organizationMemberCode: null
  }),
  methods: {
    organizationCreate() {
      // no point in dispatch here; it's temporary
      this.$store.commit('me/selectedOrganizationId', {
        organizationId: null
      })
      this.$router.push({ path: `/organizations/@new` })
    },
    async organizationJoin() {
      try {
        const organizationId = await this.$store.dispatch(
          'organizations/join',
          {
            meId: this.$store.state.me.id,
            organizationMemberCode: this.organizationMemberCode
          }
        )
        this.$store.dispatch('me/selectedOrganizationId', {
          organizationId
        })
      } catch (e) {
        console.log('e', e) // eslint-disable-line no-console
        this.snackbar = true
      }
    }
  }
}
</script>
