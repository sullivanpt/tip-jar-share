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
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar clipped-left fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-toolbar>
    <v-content>
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
const menuItems = [
  {
    icon: 'apps',
    title: 'Welcome',
    to: '/'
  },
  {
    icon: 'account_circle',
    title: 'Login',
    to: '/login'
  },
  {
    icon: 'cloud_upload',
    title: 'Dashboard',
    to: '/dashboard'
  }
]

export default {
  data() {
    return {
      gitRepoVersion: __GIT_REPO_VERSION__, // eslint-disable-line no-undef
      drawer: false,
      title: 'tip-jar-share (beta)'
    }
  },
  computed: {
    items() {
      return menuItems
    }
  }
}
</script>
