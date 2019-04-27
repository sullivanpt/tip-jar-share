<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <tjs-authenticate />
      </v-flex>
      <v-flex>
        <v-card>
          <v-card-text>
            If you are having trouble you might try to reset your preferences.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn>reset</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex>
        <tjs-confirm-delete
          :show="confirmDelete"
          @cancel="confirmDelete = false"
          @confirm="confirmDelete = false"
        >
          Please enter the digits 1234 to confirm you want to delete your
          account and any teams that do not have at least one other team member
          who has edit permission.
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
import TjsAuthenticate from '~/components/tjs-authenticate.vue'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'

/**
 * page is user profile
 * currently has no real purpose
 * future: tag lines, phone numbers, notifications or other user related data editing
 */
export default {
  components: { TjsAuthenticate, TjsConfirmDelete },
  data: () => ({
    confirmDelete: false
  })
}
</script>
