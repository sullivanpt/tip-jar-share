<template>
  <v-layout column>
    <v-flex v-if="!organizationSelected">
      <tjs-organization-select />
    </v-flex>
    <v-flex text-xs-center>
      <blockquote class="blockquote">
        &#8220;First, solve the problem. Then, write the code.&#8221;
        <footer>
          <small>
            <em>&mdash;John Johnson</em>
          </small>
        </footer>
      </blockquote>
    </v-flex>
  </v-layout>
</template>

<script>
import TjsOrganizationSelect from '~/components/tjs-organization-select.vue'

/**
 * the primary page for authenticated users, usually shows "the right thing"
 */
export default {
  components: {
    TjsOrganizationSelect
  },
  computed: {
    organizationSelected() {
      return this.$store.state.me.organizationSelected
    }
  }
}
</script>
