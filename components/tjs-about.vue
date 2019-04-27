<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
      <slot />
      <v-card>
        <v-card-text>
          <p>
            We built tip-jar-share to be the easiest way to manage your tip
            pool. Thank you for letting us help make your day better.
          </p>
          <p>
            Please read and understand the
            <nuxt-link to="/docs/policies">Policies and Agreements</nuxt-link>
          </p>
          <tjs-cta-help />
          <div class="text-xs-right">
            <em><small>&mdash; Patrick &amp; Rick</small></em>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from '~/components/Logo.vue'
import TjsCtaHelp from '~/components/tjs-cta-help.vue'

/**
 * this is the landing page for non-authenticated users
 */
export default {
  components: { Logo, TjsCtaHelp }
}
</script>
