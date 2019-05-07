<template>
  <v-form>
    <v-card>
      <v-card-title class="headline" v-text="reportDateFriendly"></v-card-title>
      <v-card-text>
        <v-text-field
          :value="collection.name"
          readonly
          label="cash jar station"
          hint="where this jar is located"
        />
        <v-text-field
          v-model="form.cashTips"
          :readonly="readonly"
          label="cash tips"
          hint="total tips you received in cash"
          prepend-icon="attach_money"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="formInvalid || formUnchanged"
          :color="collection.done ? null : 'primary'"
          type="submit"
          @click.prevent="submit"
          ><v-icon v-if="!collection.done">warning</v-icon> submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { reportFindById } from '~/helpers/reports'
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import { formatDate } from '~/helpers/time'

function collectionFindById(report, collectionId) {
  return report.collections.find(
    col => collectionId.toString() === col.id.toString()
  )
}

export default {
  data: () => ({
    organization: null,
    report: null,
    collection: null,
    form: {
      cashTips: null // TODO: these are placeholders
    }
  }),
  computed: {
    readonly() {
      return this.report.status === 'closed' || !this.hasMeOrganizationEdit
    },
    reportDateFriendly() {
      return formatDate(this.report.date)
    },
    hasMeOrganizationEdit() {
      return hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    formUnchanged() {
      return false // TODO: something
    },
    formInvalid() {
      return false // TODO: something
    }
  },
  asyncData({ error, params, store }) {
    const report = reportFindById(store, params.reportId)
    if (!report) {
      return error(nuxtPageNotFound)
    }
    const collection = collectionFindById(report, params.collectionId)
    if (!collection) {
      return error(nuxtPageNotFound)
    }
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    return {
      organization,
      report,
      collection
    }
  },
  methods: {
    submit() {
      // TODO: something useful
      this.$store.commit('reports/collectionUpdate', {
        reportId: this.report.id,
        id: this.collection.id,
        done: true
      })
    }
  }
}
</script>
