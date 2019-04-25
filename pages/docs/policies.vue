<template>
  <!-- eslint-disable vue/no-v-html -->
  <div v-html="content"></div>
</template>

<script>
import content from '~/components/docs/policies.md'

/**
 * https://github.com/nuxt-community/modules/tree/master/packages/markdownit
 */
export default {
  auth: false,
  computed: {
    content() {
      return content
    }
  }
}
</script>
