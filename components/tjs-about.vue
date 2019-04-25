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
          <p>
            If you have questions or you found a bug, please join the official
            <a
              href="https://groups.google.com/forum/#!forum/tip-jar-share"
              target="_blank"
              title="chat"
              >google group</a
            >.
          </p>
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

/**
 * this is the landing page for non-authenticated users
 */
export default {
  auth: false,
  components: {
    Logo
  }
}
</script>
