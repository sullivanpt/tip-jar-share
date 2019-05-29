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
          :disabled="loading || formUnchanged || !valid"
          :loading="loading"
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
import { reportFindById } from '~/helpers/reports'
import {
  hasOrganizationClose,
  organizationFindById
} from '~/helpers/organizations'
import { formatDate } from '~/helpers/time'
import { formUnchanged, formUpdate, vmAsCtx } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsTextCurrency from '~/components/tjs-text-currency'

function collectionFindById(report, collectionId) {
  return report.collections.find(
    col => collectionId.toString() === col.id.toString()
  )
}

function stateFromParams({ params, store }) {
  const report = reportFindById(store, params.reportId)
  if (!report) return
  const collection = collectionFindById(report, params.collectionId)
  if (!collection) return
  const organization = organizationFindById(store, report.organizationId)
  if (!organization) return
  return { organization, report, collection }
}

export default {
  components: { TjsTextCurrency },
  mixins: [loading],
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  data() {
    const { collection } = stateFromParams(vmAsCtx(this))
    return {
      valid: true,
      form: formUpdate(
        {
          tipsCash: null
        },
        collection
      )
    }
  },
  computed: {
    organization() {
      return stateFromParams(vmAsCtx(this)).organization
    },
    report() {
      return stateFromParams(vmAsCtx(this)).report
    },
    collection() {
      return stateFromParams(vmAsCtx(this)).collection
    },
    readonly() {
      return this.report.status === 'closed' || !this.hasMeOrganizationClose
    },
    reportDateFriendly() {
      return formatDate(this.report.date)
    },
    hasMeOrganizationClose() {
      return hasOrganizationClose(this.$store.state.me.id, this.organization)
    },
    formUnchanged() {
      return formUnchanged(this.form, this.collection)
    }
  },
  methods: {
    submit() {
      this.$store.dispatch('reports/collectionUpdate', {
        reportId: this.report.id,
        collectionId: this.collection.id,
        tipsCash: this.form.tipsCash
      })
    }
  }
}
</script>
