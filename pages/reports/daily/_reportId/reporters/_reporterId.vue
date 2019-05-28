<template>
  <v-form v-model="valid">
    <v-card>
      <v-card-title class="headline" v-text="reportDateFriendly"></v-card-title>
      <v-card-text>
        <v-text-field
          :value="reporter.name"
          :hint="linkedUser ? linkedUser.text : null"
          :append-icon="linkedUser ? 'link' : null"
          readonly
          persistent-hint
          label="nick name"
        >
          <template v-slot:prepend>
            <tjs-avatar :size="32" :item="linkedUser" />
          </template>
        </v-text-field>
        <tjs-text-hours
          v-if="reporter.hoursShow"
          v-model="form.hours"
          :readonly="readonly"
          :autofocus="!readonly && !reporter.done"
          :label="fieldsMap.hours.text"
          :hint="fieldsMap.hours.hint"
          required
        />
        <tjs-text-currency
          v-if="reporter.salesTotalShow"
          v-model="form.salesTotal"
          :readonly="readonly"
          :label="fieldsMap.salesTotal.text"
          :hint="fieldsMap.salesTotal.hint"
          required
        />
        <tjs-text-currency
          v-if="reporter.salesExcludedShow"
          v-model="form.salesExcluded"
          :readonly="readonly"
          :label="fieldsMap.salesExcluded.text"
          :hint="fieldsMap.salesExcluded.hint"
          required
        />
        <tjs-text-currency
          v-if="reporter.tipsPosShow"
          v-model="form.tipsPos"
          :readonly="readonly"
          :label="fieldsMap.tipsPos.text"
          :hint="fieldsMap.tipsPos.hint"
          required
        />
        <tjs-text-currency
          v-if="reporter.tipsCashShow"
          v-model="form.tipsCash"
          :readonly="readonly"
          :label="fieldsMap.tipsCash.text"
          :hint="fieldsMap.tipsCash.hint"
          required
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="loading || formUnchanged || !valid"
          :loading="loading"
          :color="reporter.done ? null : 'primary'"
          type="submit"
          @click.prevent="submit"
          ><v-icon v-if="!reporter.done">warning</v-icon> submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { reporterIsMe, reportFindById } from '~/helpers/reports'
import {
  hasOrganizationClose,
  organizationFindById
} from '~/helpers/organizations'
import { reporterFields } from '~/helpers/formulas'
import { userOptionFindById } from '~/helpers/users'
import { formatDate } from '~/helpers/time'
import { formUnchanged } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsAvatar from '~/components/tjs-avatar'
import TjsTextCurrency from '~/components/tjs-text-currency'
import TjsTextHours from '~/components/tjs-text-hours'

function reporterFindById(report, reporterId) {
  return report.reporters.find(
    rptr => reporterId.toString() === rptr.id.toString()
  )
}

export default {
  components: { TjsAvatar, TjsTextCurrency, TjsTextHours },
  mixins: [loading],
  data: () => ({
    organization: null,
    report: null,
    reporter: null,
    valid: true,
    form: {
      hours: null,
      salesTotal: null,
      salesExcluded: null,
      tipsPos: null,
      tipsCash: null
    }
  }),
  computed: {
    readonly() {
      return (
        this.report.status === 'closed' ||
        !(this.isMe || this.hasMeOrganizationClose)
      )
    },
    fieldsMap() {
      return reporterFields.reduce((acc, fld) => {
        acc[fld.value] = fld
        return acc
      }, {})
    },
    reportDateFriendly() {
      return formatDate(this.report.date)
    },
    hasMeOrganizationClose() {
      return hasOrganizationClose(this.$store.state.me.id, this.organization)
    },
    isMe() {
      return reporterIsMe(this.$store.state.me.id, this.reporter)
    },
    /**
     * if the user is linked show it's gravatar,
     * except for logged in user sees profile picture
     */
    linkedUser() {
      if (!this.reporter.linkedId) return
      if (this.reporter.linkedId === this.$store.state.me.id) {
        return {
          // text: this.$auth.user ? this.$auth.user.name : '',
          text: 'you are this team member',
          avatar: this.$auth.user ? this.$auth.user.picture : ''
        }
      } else return userOptionFindById(this.$store, this.reporter.linkedId)
    },
    formUnchanged() {
      return formUnchanged(this.form, this.reporter)
    }
  },
  asyncData({ error, params, store }) {
    const report = reportFindById(store, params.reportId)
    if (!report) {
      return error(nuxtPageNotFound)
    }
    const reporter = reporterFindById(report, params.reporterId)
    if (!reporter) {
      return error(nuxtPageNotFound)
    }
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    const { hours, salesTotal, salesExcluded, tipsPos, tipsCash } = reporter
    return {
      organization,
      report,
      reporter,
      form: { hours, salesTotal, salesExcluded, tipsPos, tipsCash }
    }
  },
  methods: {
    submit() {
      const { hours, salesTotal, salesExcluded, tipsPos, tipsCash } = this.form
      this.$store.dispatch('reports/reporterUpdate', {
        reportId: this.report.id,
        reporterId: this.reporter.id,
        hours,
        salesTotal,
        salesExcluded,
        tipsPos,
        tipsCash
      })
    }
  }
}
</script>
