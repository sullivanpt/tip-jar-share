<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-authenticate />
      </v-flex>
      <v-flex>
        <v-form v-model="valid">
          <v-card>
            <v-card-text>
              <tjs-gravatar-field
                v-model="form.gravatar"
                :avatar="meAvatar.avatar"
                :gravatar-masked="meAvatar.gravatarMasked"
                label="your avatar"
                hint="image when your team sees you. enter an email you registered with gravatar.com."
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn color="secondary" v-on="on" @click.prevent="reset"
                    >reset</v-btn
                  >
                </template>
                <span>
                  If you are having trouble you might try to reset your
                  preferences
                </span>
              </v-tooltip>
              <v-btn
                :disabled="loading || formUnchanged || !valid"
                :loading="loading"
                type="submit"
                @click.prevent="submit"
                >submit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-form>
      </v-flex>
      <v-flex>
        <tjs-confirm-delete
          :show="confirmDelete"
          @cancel="confirmDelete = false"
          @confirm="confirmDelete = false"
        >
          <p>
            Please enter the digits 1234 to confirm you want to delete your
            account and any teams that do not have at least one other team
            member who has edit permission.
          </p>
          <p>
            After your account has been deleted you will be logged out
            automatically. If you choose to login again a new account will be
            created.
          </p>
        </tjs-confirm-delete>

        <v-card>
          <v-card-text>
            The delete account button will permanently remove your data and the
            data belonging to any teams in which you are the only remaining
            member with edit permission. Please read the
            <nuxt-link to="/docs/policies">Privacy Policy</nuxt-link>
            for details and exceptions.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="error" @click="confirmDelete = true"
              >delete account</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { formUnchanged } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsAuthenticate from '~/components/tjs-authenticate.vue'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsGravatarField from '~/components/tjs-gravatar-field'

/**
 * page is user profile
 * currently has no real purpose
 * future: tag lines, phone numbers, notifications or other user related data editing
 */
export default {
  components: { TjsAuthenticate, TjsConfirmDelete, TjsGravatarField },
  mixins: [loading],
  data() {
    const { gravatarMasked: gravatar } = this.$store.state.me
    return {
      confirmDelete: false,
      valid: true,
      form: {
        gravatar
      }
    }
  },
  computed: {
    meAvatar() {
      return {
        avatar: this.$store.state.me.avatar,
        gravatarMasked: this.$store.state.me.gravatarMasked
      }
    },
    formUnchanged() {
      return formUnchanged(this.form, {
        gravatar: this.meAvatar.gravatarMasked
      })
    }
  },
  methods: {
    submit() {
      const { gravatar } = this.form
      this.$store.dispatch('me/update', {
        gravatar
      })
    },
    async reset() {
      this.$store.commit('cookie/code', { code: null })
      const name = this.$auth.user ? this.$auth.user.name : ''
      await this.$store.dispatch('reset', { name })
      this.$router.push({ path: '/' })
    }
    // TODO: delete user and all data
  }
}
</script>
