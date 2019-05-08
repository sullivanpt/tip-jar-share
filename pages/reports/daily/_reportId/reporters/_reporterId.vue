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
          v-model="form.hours"
          :readonly="readonly"
          required
          label="hours worked"
          hint="total hours you worked today"
        />
        <tjs-text-currency
          v-model="form.salesTotal"
          :readonly="readonly"
          required
          label="gross sales"
          hint="your gross sales for the day"
        />
        <tjs-text-currency
          v-model="form.salesExcluded"
          :readonly="readonly"
          required
          label="excluded sales"
          hint="your excluded sales for the day"
        />
        <tjs-text-currency
          v-model="form.tipsPos"
          :readonly="readonly"
          required
          label="CC and POS tips"
          hint="total tips you received by credit card and point of sales"
        />
        <tjs-text-currency
          v-model="form.tipsCash"
          :readonly="readonly"
          required
          label="cash tips"
          hint="total tips you received in cash"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="formUnchanged || !valid"
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
import { reportFindById } from '~/helpers/reports'
import {
  hasOrganizationEdit,
  organizationFindById
} from '~/helpers/organizations'
import { formatDate } from '~/helpers/time'
import { formUnchanged } from '~/helpers/form-validation'
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
        !(this.isMe || this.hasMeOrganizationEdit)
      )
    },
    reportDateFriendly() {
      return formatDate(this.report.date)
    },
    hasMeOrganizationEdit() {
      return hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    isMe() {
      return this.reporter.linkedId === this.$store.state.me.id
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
      } else {
        return {
          text: `name for ${this.reporter.linkedId}`
          // TODO: linked user gravatar
        }
      }
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
      this.$store.commit('reports/reporterUpdate', {
        reportId: this.report.id,
        id: this.reporter.id,
        done: true,
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
