<template>
  <v-card>
    <v-card-text>
      <v-text-field v-model="name" label="team name" :readonly="readonly" />
      <v-text-field v-model="avatar" label="avatar URL" :readonly="readonly" />
    </v-card-text>
    <v-card-actions>
      <v-btn :disabled="formInvalid" @click="submit">submit</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    // TODO: edit mode
    name: null,
    avatar: null
  }),
  computed: {
    readonly() {
      return false
    },
    formInvalid() {
      return !this.name
    }
  },
  methods: {
    submit() {
      // TODO: edit mode
      this.$store.commit('organizations/create', {
        name: this.name,
        avatar: this.avatar
      })
    }
  }
}
</script>
