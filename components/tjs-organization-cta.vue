<template>
  <v-card>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="toOrganization">finish setup</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
/**
 * CTA to finish currently selected organization
 * assumes selectedOrganizationId is valid
 */
export default {
  methods: {
    toOrganization() {
      const organizationId = this.$store.state.me.selectedOrganizationId
      this.$router.push({ path: `/organizations/${organizationId}` })
    }
  }
}
</script>
