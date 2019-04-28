<template>
  <v-card>
    <v-card-text v-if="!loggedIn" class="text-xs-center">
      <v-btn :disable="loading" color="#4284f4" @click="loginWithGoogle"
        >login with google</v-btn
      >
    </v-card-text>
    <v-card-text v-if="!loggedIn">
      Welcome to the open beta. To use the app you must agree to our Policies
      and Agreements. And of course you must agree to hold us harmless for any
      errors. There will be mistakes.
    </v-card-text>
    <v-card-text v-if="loggedIn">
      <v-list-tile>
        <v-list-tile-avatar v-if="userPicture" color="grey darken-3">
          <v-img :src="userPicture" class="elevation-6"></v-img>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ userName }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-card-text>
    <v-card-actions v-if="loggedIn">
      <v-spacer />
      <v-btn :disable="loading" color="warning" @click="logout">logout</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  computed: {
    loading() {
      return this.$store.getters.loading || this.$auth.busy
    },
    loggedIn() {
      return this.$auth.loggedIn
    },
    userName() {
      return this.loggedIn ? this.$auth.user.name : ''
    },
    userPicture() {
      return this.loggedIn ? this.$auth.user.picture : ''
    }
  },
  methods: {
    logout() {
      // TODO: the $auth me.js is not called on logout, not sure why
      this.$store.commit('me/expel')
      return this.$auth.logout()
    },
    loginWithGoogle() {
      return this.$auth.loginWith('google')
    }
  }
}
</script>
