<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-organization-select v-if="!options.isSelected" />
        <tjs-organization-cta v-if="options.isSelected && !options.isReady" />
      </v-flex>
      <tjs-reports-cta v-if="options.isReady" />
      <v-flex v-if="options.isSelected && codeWaiting">
        <tjs-organization-join />
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
  </v-container>
</template>

<script>
import {
  organizationFindById,
  organizationReadyToReport
} from '~/helpers/organizations'
import TjsOrganizationCta from '~/components/tjs-organization-cta'
import TjsOrganizationJoin from '~/components/tjs-organization-join'
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
    TjsOrganizationCta,
    TjsOrganizationJoin,
    TjsReportsCta
  },
  computed: {
    codeWaiting() {
      return this.$store.state.cookie.code
    },
    options() {
      // if our organization doesn't exist anymore show select
      const organizationId = this.$store.state.me.selectedOrganizationId
      const organization = organizationFindById(this.$store, organizationId)
      return {
        isSelected: !!organization,
        isReady: organizationReadyToReport(organization)
      }
    }
  },
  fetch(ctx) {
    return ctx.store.dispatch('refresh', { hint: 'dashboard' })
  }
}
</script>
