<template>
  <v-avatar :size="size" :color="item | colorFromText">
    <img v-if="item.avatar" :src="item.avatar" />
    <span v-else class="white--text headline">{{
      item | initialsFromText
    }}</span>
  </v-avatar>
</template>

<script>
import { colorFromText, initialsFromText } from '~/helpers/color'

export default {
  filters: {
    colorFromText,
    initialsFromText
  },
  props: {
    item: { type: Object, default: () => ({}) },
    size: { type: Number, default: 48 }
  }
}
</script>
