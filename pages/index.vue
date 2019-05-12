<template>
  <v-layout column>
    <v-flex v-if="!selectedOrganizationId">
      <tjs-organization-select />
    </v-flex>
    <tjs-reports-cta v-if="selectedOrganizationId" />
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
import { organizationFindById } from '~/helpers/organizations'
import TjsOrganizationSelect from '~/components/tjs-organization-select.vue'
import TjsReportsCta from '~/components/tjs-reports-cta.vue'

/**
 * the primary page for authenticated users, usually shows "the right thing"
 * TODO: how to render and choose when multiple organizations
 * have reports that need filling in (beyond the selected one in title bar).
 * maybe a banner that says "2 other teams waiting" that null selected
 * organization when clicked.
 */
export default {
  components: {
    TjsOrganizationSelect,
    TjsReportsCta
  },
  computed: {
    selectedOrganizationId() {
      // if our organization doesn't exist anymore show select
      // TODO: not loaded yet?
      const organizationId = this.$store.state.me.selectedOrganizationId
      return organizationFindById(this.$store, organizationId)
        ? organizationId
        : null
    }
  }
}
</script>
