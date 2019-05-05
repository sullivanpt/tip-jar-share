<template>
  <v-form>
    <v-card>
      <v-card-text>
        <v-text-field
          v-model="form.name"
          label="position"
          hint="a team role such as bartender or waitress"
          :readonly="readonly"
        />
        <v-select
          v-model="form.rule"
          :items="['beneficiary', 'contributor', 'excluded']"
          label="allocation rule"
          hint="formula used to compute the share for all team members in this role"
          :readonly="readonly"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
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

function positionFindById(organization, positionId) {
  return organization.positions.find(
    pos => positionId.toString() === pos.id.toString()
  )
}

export default {
  data: () => ({
    organization: null,
    position: null,
    form: {
      name: null,
      rule: null
    }
  }),
  computed: {
    exists() {
      return !!this.position
    },
    readonly() {
      return !hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    formUnchanged() {
      const { name, rule } = this.position || {}
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
    if (params.positionId !== '@new') {
      const position = positionFindById(organization, params.positionId)
      if (!position) {
        return error(nuxtPageNotFound)
      }
      const { name, rule } = position
      return {
        organization,
        position,
        form: { name, rule }
      }
    }
    return { organization }
  },
  methods: {
    submit() {
      const { name, rule } = this.form
      if (this.exists) {
        this.$store.commit('organizations/positionUpdate', {
          organizationId: this.organization.id,
          id: this.position.id,
          name,
          rule
        })
      } else {
        this.$store.commit('organizations/positionCreate', {
          organizationId: this.organization.id,
          name,
          rule
        })
        // TODO: redirect to new ID using dispatch
        const newId = this.organization.positions.slice(-1)[0].id
        this.$router.replace({
          path: `/organizations/${this.organization.id}/positions/${newId}`
        })
      }
    }
  }
}
</script>
