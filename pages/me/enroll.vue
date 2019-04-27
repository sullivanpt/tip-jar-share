<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
      <slot />
      <v-card>
        <v-card-text>
          <p>Please wait while your account is verified.</p>
          <tjs-cta-help />
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from '~/components/Logo.vue'
import TjsCtaHelp from '~/components/tjs-cta-help.vue'

/**
 * page's primary purpose is for OAuth redirection return
 * note: this page is not explicitly listed in the nav menu
 *
 * TODO: validate tokens and create new users https://developers.google.com/identity/sign-in/web/backend-auth
 */
export default {
  auth: false,
  components: { Logo, TjsCtaHelp }
}
</script>
