<template>
  <v-form>
    <tjs-confirm-delete
      :show="confirmDelete"
      @cancel="confirmDelete = false"
      @confirm="
        confirmDelete = false
        deleteStation()
      "
    >
      Please enter the digits 1234 to confirm you want to permanently delete
      this station from future reports.
    </tjs-confirm-delete>

    <v-card>
      <v-card-text>
        <v-text-field
          v-model="form.name"
          label="cash jar station"
          hint="where this jar is located such as bar or register counter"
          :readonly="readonly"
        />
        <v-select
          v-model="form.rule"
          :items="['contributor']"
          label="allocation rule"
          hint="formula used to compute the share for team members"
          :readonly="readonly"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn v-if="exists && !readonly" flat @click="confirmDelete = true">
          <v-icon>delete</v-icon>
        </v-btn>
        <v-btn
          :disabled="formInvalid || formUnchanged"
          type="submit"
          @click.prevent="submit"
          >submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'

function stationFindById(organization, stationId) {
  return organization.stations.find(
    stn => stationId.toString() === stn.id.toString()
  )
}

export default {
  components: { TjsConfirmDelete },
  data: () => ({
    confirmDelete: false,
    organization: null,
    station: null,
    form: {
      name: null,
      rule: null
    }
  }),
  computed: {
    exists() {
      return !!this.station
    },
    readonly() {
      return !hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    formUnchanged() {
      const { name, rule } = this.station || {}
      return this.form.name === name && this.form.rule === rule
    },
    formInvalid() {
      return !this.form.name || !this.form.rule
    }
  },
  asyncData({ error, params, store }) {
    // TODO: await store.dispatch('organizations/load')
    const organization = organizationFindById(store, params.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    if (params.stationId !== '@new') {
      const station = stationFindById(organization, params.stationId)
      if (!station) {
        return error(nuxtPageNotFound)
      }
      const { name, rule } = station
      return {
        organization,
        station,
        form: { name, rule }
      }
    }
    return { organization }
  },
  methods: {
    deleteStation() {
      this.$store.commit('organizations/stationDelete', {
        organizationId: this.organization.id,
        id: this.station.id
      })
      this.$router.push({ path: `/organizations/${this.organization.id}` })
    },
    submit() {
      const { name, rule } = this.form
      if (this.exists) {
        this.$store.commit('organizations/stationUpdate', {
          organizationId: this.organization.id,
          id: this.station.id,
          name,
          rule
        })
      } else {
        this.$store.commit('organizations/stationCreate', {
          organizationId: this.organization.id,
          name,
          rule
        })
        // TODO: redirect to new ID using dispatch
        const newId = this.organization.stations.slice(-1)[0].id
        this.$router.replace({
          path: `/organizations/${this.organization.id}/stations/${newId}`
        })
      }
    }
  }
}
</script>
