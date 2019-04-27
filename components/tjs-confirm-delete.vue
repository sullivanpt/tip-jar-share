<template>
  <v-dialog :value="show">
    <v-card>
      <v-card-text>
        <slot>Please enter the digits 1234 to confirm</slot>
      </v-card-text>
      <v-card-text>
        <v-text-field v-model="confirmCode" outline hide-details single-line />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click.prevent="cancel">cancel</v-btn>
        <v-btn
          :disabled="confirmCode !== '1234'"
          color="error"
          @click.prevent="confirm"
          >confirm</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: { type: Boolean, default: false }
  },
  data: () => ({
    confirmCode: null
  }),
  methods: {
    cancel() {
      this.confirmCode = null
      this.$emit('cancel')
    },
    confirm() {
      this.confirmCode = null
      this.$emit('confirm')
    }
  }
}
</script>
