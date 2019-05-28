<template>
  <v-form v-model="valid">
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
        <tjs-text-field
          v-model="form.name"
          :readonly="readonly"
          required
          label="cash jar station"
          hint="where this jar is located such as bar or register counter"
        />
        <tjs-select
          v-model="form.position"
          :items="positionOptions"
          required
          label="position"
          hint="position pool assigned to this jar"
          :readonly="readonly"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn v-if="exists && !readonly" flat @click="confirmDelete = true">
          <v-icon>delete</v-icon>
        </v-btn>
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
</template>

<script>
import {
  hasOrganizationEdit,
  organizationFindById,
  organizationPositionOptions
} from '~/helpers/organizations'
import { formUnchanged } from '~/helpers/form-validation'
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { loading } from '~/mixins/loading'
import TjsConfirmDelete from '~/components/tjs-confirm-delete.vue'
import TjsSelect from '~/components/tjs-select'
import TjsTextField from '~/components/tjs-text-field'

function stationFindById(organization, stationId) {
  return organization.stations.find(
    stn => stationId.toString() === stn.id.toString()
  )
}

export default {
  components: { TjsConfirmDelete, TjsSelect, TjsTextField },
  mixins: [loading],
  data: () => ({
    confirmDelete: false,
    organization: null,
    station: null,
    valid: true,
    form: {
      name: null,
      position: null
    }
  }),
  computed: {
    exists() {
      return !!this.station
    },
    readonly() {
      return !hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    positionOptions() {
      return organizationPositionOptions(this.$store, this.organization)
    },
    formUnchanged() {
      return formUnchanged(this.form, this.station)
    }
  },
  asyncData({ error, params, store }) {
    const organization = organizationFindById(store, params.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    if (params.stationId !== '@new') {
      const station = stationFindById(organization, params.stationId)
      if (!station) {
        return error(nuxtPageNotFound)
      }
      const { name, position } = station
      return {
        organization,
        station,
        form: { name, position }
      }
    }
    return { organization }
  },
  methods: {
    async deleteStation() {
      try {
        await this.$store.dispatch('organizations/stationDelete', {
          organizationId: this.organization.id,
          stationId: this.station.id
        })
        this.$router.push({ path: `/organizations/${this.organization.id}` })
      } catch (e) {}
    },
    async submit() {
      try {
        const { name, position } = this.form
        if (this.exists) {
          this.$store.dispatch('organizations/stationUpdate', {
            organizationId: this.organization.id,
            stationId: this.station.id,
            name,
            position
          })
        } else {
          const stationId = await this.$store.dispatch(
            'organizations/stationCreate',
            {
              organizationId: this.organization.id,
              name,
              position
            }
          )
          this.$router.replace({
            path: `/organizations/${this.organization.id}/stations/${stationId}`
          })
        }
      } catch (e) {}
    }
  }
}
</script>
