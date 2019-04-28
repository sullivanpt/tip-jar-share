<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list>
        <v-list-tile
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
            <v-list-tile-sub-title v-text="item.subtitle" />
          </v-list-tile-content>
          <v-list-tile-avatar v-if="item.avatar">
            <img :src="item.avatar" />
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar clipped-left fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <tjs-avatar
        v-if="selectedOrganization"
        :item="selectedOrganization"
        :size="32"
      />
    </v-toolbar>
    <v-content>
      <v-progress-linear
        v-if="loading"
        :indeterminate="true"
        secondary
        height="4"
        style="position: absolute; margin: 0;"
      />
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer fixed app>
      <span>v{{ gitRepoVersion }}</span>
      <v-spacer />
      <span>Copyright &copy; 2019 Creava, Inc.</span>
    </v-footer>
  </v-app>
</template>

<script>
import { applicationTitle, primaryMenuItems } from '~/helpers/site-map.js'
import TjsAvatar from '~/components/tjs-avatar'

export default {
  components: { TjsAvatar },
  data() {
    return {
      gitRepoVersion: __GIT_REPO_VERSION__, // eslint-disable-line no-undef
      drawer: false
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading || this.$auth.busy
    },
    /**
     * title bar shows selected organization if any, else applicationTitle
     */
    title() {
      const organization = this.selectedOrganization
      if (organization) return organization.text
      return applicationTitle
    },
    selectedOrganization() {
      return this.$store.getters['organizations/organizationOptions'].find(
        org => org.value === this.$store.state.me.organizationSelected
      )
    },
    items() {
      return primaryMenuItems({
        meName: this.$auth.user ? this.$auth.user.name : '',
        meAvatar: this.$auth.user ? this.$auth.user.picture : '',
        organizationId: this.$store.state.me.organizationSelected
      })
    }
  }
}
</script>
