<template>
  <v-form>
    <v-card>
      <v-card-text>
        <slot>Join a another existing team or create another new team.</slot>
      </v-card-text>
      <v-card-text>
        <v-text-field
          v-model="organizationMemberCode"
          :append-icon="organizationMemberCode ? 'clear' : null"
          label="enter your team code"
          mask="NNN-NNN"
          @click:append="clearCode"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="loading || !!organizationMemberCode"
          :loading="loading"
          @click="organizationCreate"
          >create a new team</v-btn
        >
        <v-btn
          :disabled="loading || organizationMemberCode.length !== 6"
          :loading="loading"
          color="primary"
          type="submit"
          @click.prevent="organizationJoin"
          >join</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { loading } from '~/mixins/loading'

function formatCode(code) {
  return (code || '').replace('-', '') // FUTURE: hyphens away
}

export default {
  mixins: [loading],
  data() {
    return {
      organizationMemberCode: formatCode(this.$store.state.cookie.code)
    }
  },
  methods: {
    clearCode() {
      // clear code from control, store and cookie
      this.organizationMemberCode = ''
      this.$store.commit('cookie/code', { code: null })
    },
    organizationCreate() {
      // no point in dispatch here; it's temporary
      this.$store.commit('me/selectedOrganizationId', {
        organizationId: null
      })
      this.$router.push({ path: `/organizations/@new` })
    },
    async organizationJoin() {
      try {
        const organizationMemberCode = this.organizationMemberCode
          .toUpperCase()
          .replace(/(\w{3})(\w{3})/, '$1-$2')
        const organizationId = await this.$store.dispatch(
          'organizations/join',
          {
            organizationMemberCode
          }
        )
        this.$store.dispatch('me/selectedOrganizationId', {
          organizationId
        })
        this.$store.commit('cookie/code', { code: null })
      } catch (e) {}
    }
  }
}
</script>
