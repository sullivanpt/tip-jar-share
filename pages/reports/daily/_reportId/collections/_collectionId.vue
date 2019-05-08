<template>
  <v-form v-model="valid">
    <v-card>
      <v-card-title class="headline" v-text="reportDateFriendly"></v-card-title>
      <v-card-text>
        <v-text-field
          :value="collection.name"
          readonly
          label="cash jar station"
          hint="where this jar is located"
        />
        <tjs-text-currency
          v-model="form.tipsCash"
          :readonly="readonly"
          :autofocus="!readonly && !collection.done"
          required
          label="cash tips"
          hint="total cash tips this jar contained"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="formUnchanged || !valid"
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
import { formUnchanged } from '~/helpers/form-validation'
import TjsTextCurrency from '~/components/tjs-text-currency'

function collectionFindById(report, collectionId) {
  return report.collections.find(
    col => collectionId.toString() === col.id.toString()
  )
}

export default {
  components: { TjsTextCurrency },
  data: () => ({
    organization: null,
    report: null,
    collection: null,
    valid: true,
    form: {
      tipsCash: null
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
      return formUnchanged(this.form, this.collection)
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
    const { tipsCash } = collection
    return {
      organization,
      report,
      collection,
      form: { tipsCash }
    }
  },
  methods: {
    submit() {
      this.$store.commit('reports/collectionUpdate', {
        reportId: this.report.id,
        id: this.collection.id,
        done: true,
        tipsCash: this.form.tipsCash
      })
    }
  }
}
</script>
