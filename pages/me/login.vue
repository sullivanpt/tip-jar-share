<template>
  <tjs-about>
    <tjs-authenticate />
  </tjs-about>
</template>

<script>
import TjsAbout from '~/components/tjs-about.vue'
import TjsAuthenticate from '~/components/tjs-authenticate.vue'

/**
 * page is where users are redirected to when they try to access a protected page
 * user can begin the login or login and sign-up process from here
 * note: this page is not explicitly listed in the nav menu
 */
export default {
  auth: false,
  components: {
    TjsAbout,
    TjsAuthenticate
  }
}
</script>
