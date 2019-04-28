<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-authenticate />
      </v-flex>
      <v-flex>
        <v-card>
          <v-card-text>
            <tjs-gravatar-field
              v-model="form.gravatar"
              :name="form.name"
              label="your gravatar"
              hint="how your team sees you. enter the email you registered with gravatar.com."
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn color="secondary" v-on="on">reset</v-btn>
              </template>
              <span>
                If you are having trouble you might try to reset your
                preferences
              </span>
            </v-tooltip>
            <v-btn
              :disabled="formInvalid || formUnchanged"
              type="submit"
              @click.prevent="submit"
              >submit</v-btn
            >
          </v-card-actions>
        </v-card>
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
import { buildGravatarUrl } from '~/helpers/gravatar'
import TjsAuthenticate from '~/components/tjs-authenticate.vue'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsGravatarField from '~/components/tjs-gravatar-field'

/**
 * page is user profile
 * currently has no real purpose
 * future: tag lines, phone numbers, notifications or other user related data editing
 * TODO: gravatar so other users can see us
 */
export default {
  components: { TjsAuthenticate, TjsConfirmDelete, TjsGravatarField },
  data: () => ({
    confirmDelete: false,
    form: {
      gravatar: null
    }
  }),
  computed: {
    gravatarInvalid() {
      return !!this.form.gravatar && !buildGravatarUrl(this.form.gravatar)
    },
    formUnchanged() {
      const { gravatar } = this.$store.state.me
      return this.form.gravatar === gravatar
    },
    formInvalid() {
      return this.gravatarInvalid
    }
  },
  asyncData({ store }) {
    const { gravatar } = store.state.me
    return {
      form: { gravatar }
    }
  },
  methods: {
    submit() {
      const { gravatar } = this.form
      const avatar = buildGravatarUrl(gravatar) || null
      this.$store.commit('me/update', {
        gravatar,
        avatar
      })
    }
  }
}
</script>
