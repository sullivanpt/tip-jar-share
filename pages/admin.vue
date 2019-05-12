<template>
  <v-card>
    <v-card-text>
      <v-text-field v-model="secret" label="word of the day" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="error" @click="modelsReset">reset</v-btn>
    </v-card-actions>

    <v-snackbar v-model="snackbar" color="success">success</v-snackbar>
  </v-card>
</template>

<script>
/**
 * quick and dirty admin page
 */
export default {
  auth: false,
  data: () => ({
    snackbar: false,
    secret: null
  }),
  methods: {
    async modelsReset() {
      try {
        await this.$api.modelsReset({ secret: this.secret })
        this.snackbar = true
      } catch (e) {}
    }
  }
}
</script>
