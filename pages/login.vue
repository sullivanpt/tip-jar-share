<template>
  <tjs-authenticate />
</template>

<script>
import TjsAuthenticate from '~/components/tjs-authenticate.vue'

export default {
  auth: false,
  components: { TjsAuthenticate },
  methods: {
    loginWithGoogle() {
      this.$auth.loginWith('google')
    }
  }
}
</script>
