<template>
  <v-text-field
    v-model="gravatar"
    :rules="rules"
    :placeholder="gravatarMasked"
    v-bind="$attrs"
    v-on="$listeners"
    @change="update"
  >
    <template v-slot:prepend>
      <tjs-avatar :size="32" :item="item" />
    </template>
    <template v-slot:append-outer>
      <v-tooltip top close-delay="1000">
        <template v-slot:activator="{ on }">
          <img
            width="24"
            height="24"
            src="/logo-gravatar.png"
            alt="gravatar logo"
            v-on="on"
          />
        </template>
        For more information visit
        <a href="https://gravatar.com/" target="_blank"
          >https://gravatar.com/</a
        >
      </v-tooltip>
    </template>
  </v-text-field>
</template>

<script>
/* eslint-disable */
import { buildGravatarUrl } from '~/helpers/gravatar'
import { rules } from '~/helpers/form-validation'
import TjsAvatar from '~/components/tjs-avatar'

/**
 * enter and show a gravatar along with hints as to what one is
 * TODO: type="email" validation prevents submt with no helpful message
 */
export default {
  components: { TjsAvatar },
  inheritAttrs: false,
  model: { prop: 'tjsValue', event: 'update:tjsValue' },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    tjsValue: { default: '' },
    avatar: { type: String, default: '' },
    gravatarMasked: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  data: () => ({
    modified: false,
    gravatar: null
  }),
  watch: {
    tjsValue: {
      handler(newValue) {
        this.modified = newValue !== this.gravatarMasked
        this.gravatar = this.modified ? newValue : null
      },
      immediate: true
    }
  },
  computed: {
    item() {
      return {
        text: this.name,
        avatar: this.modified ? buildGravatarUrl(this.gravatar) : this.avatar
      }
    },
    rules() {
      return rules({ gravatar: this.modified })
    }
  },
  methods: {
    update() {
      this.$emit('update:tjsValue', this.gravatar)
    }
  }
}
</script>
