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
      <v-toolbar-side-icon v-if="!showBack" @click="drawer = !drawer" />
      <v-btn v-if="showBack" icon @click.stop="back">
        <v-icon>arrow_back_ios</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <tjs-avatar
        v-if="selectedOrganization"
        :item="selectedOrganization"
        :size="32"
      />
    </v-toolbar>
    <v-content>
      <v-container>
        <v-progress-linear
          v-if="loading"
          :indeterminate="true"
          color="accent"
          height="8"
          style="position: absolute; margin: 0;"
        />
        <nuxt />
        <v-snackbar v-model="oops" color="error" bottom>
          {{ oopsMessage }}
          <v-btn flat @click="oops = false">close</v-btn>
        </v-snackbar>
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
import {
  applicationTitle,
  gitRepoVersion,
  primaryMenuItems
} from '~/helpers/site-map.js'
import { loading } from '~/mixins/loading'
import TjsAvatar from '~/components/tjs-avatar'

export default {
  components: { TjsAvatar },
  mixins: [loading],
  data() {
    return {
      gitRepoVersion,
      drawer: false
    }
  },
  computed: {
    oops: {
      get() {
        return this.$store.state.oops
      },
      set(value) {
        this.$store.commit('oops', value)
      }
    },
    oopsMessage() {
      return this.$store.state.oopsMessage || 'oops! please try again later'
    },
    /**
     * title bar shows selected organization if any, else applicationTitle
     */
    title() {
      const organization = this.selectedOrganization
      if (organization) return organization.text
      return applicationTitle
    },
    showBack() {
      const path = this.$route.path
      if (path.startsWith('/me')) return false
      return !this.items.find(itm => itm.to === path)
    },
    selectedOrganization() {
      return this.$store.getters['organizations/organizationOptions'].find(
        org => org.value === this.$store.state.me.selectedOrganizationId
      )
    },
    items() {
      return primaryMenuItems({
        meName: this.$auth.user ? this.$auth.user.name : '',
        meAvatar: this.$auth.user ? this.$auth.user.picture : '',
        organizationId: this.$store.state.me.selectedOrganizationId
      })
    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    }
  }
}
</script>
