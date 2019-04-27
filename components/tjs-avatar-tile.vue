<template>
  <v-list-tile-avatar :color="item | colorFromText">
    <img v-if="item.avatar" :src="item.avatar" />
    <span v-else class="white--text headline">{{
      item | initialsFromText
    }}</span>
  </v-list-tile-avatar>
</template>

<script>
import { colorFromText, initialsFromText } from '~/helpers/color'

// TODO: merge with tjs-avatar
export default {
  filters: {
    colorFromText,
    initialsFromText
  },
  props: {
    item: { type: Object, default: () => ({}) }
  }
}
</script>
