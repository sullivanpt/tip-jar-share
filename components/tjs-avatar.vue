<template>
  <v-avatar :color="item | colorFromText">
    <img v-if="item.avatar" :src="item.avatar" />
    <span v-else class="white--text headline">{{ item.text[0] }}</span>
  </v-avatar>
</template>

<script>
import { colorFromText } from '~/helpers/color'

export default {
  filters: {
    colorFromText
  },
  props: {
    item: { type: Object, default: () => ({}) }
  }
}
</script>
