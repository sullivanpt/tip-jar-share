<template>
  <tjs-authenticate />
</template>

<script>
import TjsAuthenticate from '~/components/tjs-authenticate.vue'

/**
 * page is user profile
 * currently has no real purpose
 * future: tag lines, phone numbers, notifications or other user related data editing
 */
export default {
  components: { TjsAuthenticate }
}
</script>
