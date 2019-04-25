<template>
  <tjs-about>
    <tjs-authenticate />
  </tjs-about>
</template>

<script>
import TjsAbout from '~/components/tjs-about.vue'
import TjsAuthenticate from '~/components/tjs-authenticate.vue'

/**
 * page's primary purpose is for OAuth redirection return
 * future: might also be used for username/password log out
 * note: this page is not explicitly listed in he nav menu
 *
 * TODO: validate tokens and create new users https://developers.google.com/identity/sign-in/web/backend-auth
 */
export default {
  auth: false,
  components: {
    TjsAbout,
    TjsAuthenticate
  }
}
</script>
