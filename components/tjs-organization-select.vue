<template>
  <v-select
    v-if="organizationOptions.length"
    v-model="selectedOrganizationId"
    :items="organizationOptions"
    label="your active team"
    box
    chips
  >
    <template v-slot:selection="data">
      <v-chip>
        <tjs-avatar :item="data.item" />
        {{ data.item.text }}
      </v-chip>
    </template>
    <template v-slot:item="data">
      <tjs-avatar-tile :item="data.item" />
      <v-list-tile-content>
        <v-list-tile-title>{{ data.item.text }}</v-list-tile-title>
      </v-list-tile-content>
    </template>
  </v-select>

  <tjs-organization-join v-else>
    <p>
      Thank you for signing up. If you are joining an existing team you should
      enter the "team code" your manager gave you here.
    </p>
    <p>Or if you want to manage a new team you can create it now.</p>
  </tjs-organization-join>
</template>

<script>
import TjsOrganizationJoin from '~/components/tjs-organization-join'
import TjsAvatar from '~/components/tjs-avatar'
import TjsAvatarTile from '~/components/tjs-avatar-tile'

/**
 * shows the current organization and lets the user select a different one, or
 * add a new one if none exist.
 */
export default {
  components: { TjsAvatar, TjsAvatarTile, TjsOrganizationJoin },
  computed: {
    selectedOrganizationId: {
      get() {
        return this.$store.state.me.selectedOrganizationId
      },
      set(organizationId) {
        return this.$store.dispatch('me/selectedOrganizationId', {
          organizationId
        })
      }
    },
    organizationOptions() {
      return this.$store.getters['organizations/organizationOptions']
    }
  }
}
</script>
