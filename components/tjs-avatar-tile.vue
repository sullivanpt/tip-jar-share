<template>
  <v-list-tile-avatar :color="item | colorFromText">
    <img v-if="item.avatar" :src="item.avatar" />
    <span v-else class="white--text headline">{{ item.text[0] }}</span>
  </v-list-tile-avatar>
</template>

<script>
import { colorFromText } from '~/helpers/color'

// TODO: merge with tjs-avatar
export default {
  filters: {
    colorFromText
  },
  props: {
    item: { type: Object, default: () => ({}) }
  }
}
</script>
