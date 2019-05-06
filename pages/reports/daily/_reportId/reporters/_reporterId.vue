<template>
  <v-form>
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
        <v-text-field
          v-model="form.hours"
          :readonly="readonly"
          label="hours worked"
          hint="total hours you worked today"
          prepend-icon="timelapse"
        />
        <v-text-field
          v-model="form.gross"
          :readonly="readonly"
          label="gross sales"
          hint="your gross sales for the day"
          prepend-icon="attach_money"
        />
        <v-text-field
          v-model="form.cashTips"
          :readonly="readonly"
          label="cash tips"
          hint="total tips you received in cash"
          prepend-icon="attach_money"
        />
        <v-text-field
          v-model="form.posTips"
          :readonly="readonly"
          label="CC and POS tips"
          hint="total tips you received by credit card and point of sales"
          prepend-icon="attach_money"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="formInvalid || formUnchanged"
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
import TjsAvatar from '~/components/tjs-avatar'

function reporterFindById(report, reporterId) {
  return report.reporters.find(
    rptr => reporterId.toString() === rptr.id.toString()
  )
}

export default {
  components: { TjsAvatar },
  data: () => ({
    organization: null,
    report: null,
    reporter: null,
    form: {
      hours: null,
      gross: null,
      cashTips: null, // TODO: these are placeholders
      posTips: null
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
    const reporter = reporterFindById(report, params.reporterId)
    if (!reporter) {
      return error(nuxtPageNotFound)
    }
    const organization = organizationFindById(store, report.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    return {
      organization,
      report,
      reporter
    }
  },
  methods: {
    submit() {
      // TODO: something useful
      this.$store.commit('reports/reporterUpdate', {
        reportId: this.report.id,
        id: this.reporter.id,
        done: true
      })
    }
  }
}
</script>
