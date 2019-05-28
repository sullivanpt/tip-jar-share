/**
 * vuejs mixin to easily retrieve loading vuex state
 */
export const loading = {
  computed: {
    loading() {
      return this.$store.getters.loading || this.$auth.busy
    }
  }
}
