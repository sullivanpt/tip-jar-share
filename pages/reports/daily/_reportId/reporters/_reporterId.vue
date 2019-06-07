<template>
  <v-form v-model="valid">
    <v-snackbar v-model="doneSnackbar" color="success">
      <div>have a great night</div>
      <v-btn flat @click.native="copySnackbar = false">Close</v-btn>
    </v-snackbar>

    <v-card>
      <v-card-title class="headline" v-text="reportDateFriendly"></v-card-title>
      <v-card-text>
        <v-text-field
          v-model="form.name"
          :hint="linkedUser ? linkedUser.text : null"
          :append-icon="linkedUser ? 'link' : null"
          :readonly="exists"
          persistent-hint
          label="nick name"
        >
          <template v-slot:prepend>
            <tjs-avatar :size="32" :item="linkedUser" />
          </template>
        </v-text-field>
        <tjs-select
          v-model="form.position"
          :items="positionOptions"
          :readonly="readonly"
          required
          label="position"
          hint="a team role such as bartender or waitress"
          prepend-icon="person_pin_circle"
          @change="positionChanged"
        />
        <tjs-text-hours
          v-if="exists && reporter.hoursShow"
          v-model="form.hours"
          :readonly="readonly"
          :autofocus="!readonly && !reporter.done"
          :label="fieldsMap.hours.text"
          :hint-empty="fieldsMap.hours.hint"
          required
        />
        <tjs-text-currency
          v-if="exists && reporter.salesTotalShow"
          v-model="form.salesTotal"
          :readonly="readonly"
          :label="fieldsMap.salesTotal.text"
          :hint="fieldsMap.salesTotal.hint"
          required
        />
        <tjs-text-currency
          v-if="exists && reporter.salesExcludedShow"
          v-model="form.salesExcluded"
          :readonly="readonly"
          :label="fieldsMap.salesExcluded.text"
          :hint="fieldsMap.salesExcluded.hint"
          required
        />
        <tjs-text-currency
          v-if="exists && reporter.tipsPosShow"
          v-model="form.tipsPos"
          :readonly="readonly"
          :label="fieldsMap.tipsPos.text"
          :hint="fieldsMap.tipsPos.hint"
          required
        />
        <tjs-text-currency
          v-if="exists && reporter.tipsCashShow"
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
          :color="!exists || reporter.done ? null : 'primary'"
          type="submit"
          @click.prevent="submit"
          ><v-icon v-if="exists && !reporter.done">warning</v-icon>
          submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import { reporterIsMe, reportFindById } from '~/helpers/reports'
import {
  hasOrganizationClose,
  organizationFindById,
  organizationPositionOptions
} from '~/helpers/organizations'
import {
  forumulaEnforceEnabledValues,
  formulaFindById,
  reporterFields
} from '~/helpers/formulas'
import { userOptionFindById } from '~/helpers/users'
import { formatDate } from '~/helpers/time'
import { formUnchanged, formUpdate, vmAsCtx } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsAvatar from '~/components/tjs-avatar'
import TjsSelect from '~/components/tjs-select'
import TjsTextCurrency from '~/components/tjs-text-currency'
import TjsTextHours from '~/components/tjs-text-hours'

function reporterFindById(report, reporterId) {
  return report.reporters.find(
    rptr => reporterId.toString() === rptr.id.toString()
  )
}

function stateFromParams({ params, store }) {
  const report = reportFindById(store, params.reportId)
  if (!report) return
  let reporter = null
  if (params.reporterId !== '@new') {
    reporter = reporterFindById(report, params.reporterId)
    if (!reporter) return
  }
  const organization = organizationFindById(store, report.organizationId)
  if (!organization) return
  return { organization, report, reporter }
}

export default {
  components: { TjsAvatar, TjsSelect, TjsTextCurrency, TjsTextHours },
  mixins: [loading],
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  data() {
    const { reporter } = stateFromParams(vmAsCtx(this))
    return {
      doneSnackbar: false,
      valid: true,
      reporterOverride: null,
      form: formUpdate(
        {
          name: null,
          position: null,
          hours: null,
          salesTotal: null,
          salesExcluded: null,
          tipsPos: null,
          tipsCash: null
        },
        reporter
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
    reporter() {
      return this.reporterOverride || stateFromParams(vmAsCtx(this)).reporter
    },
    exists() {
      return !!this.reporter
    },
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
      return this.exists && reporterIsMe(this.$store.state.me.id, this.reporter)
    },
    /**
     * if the user is linked show it's gravatar,
     * except for logged in user sees profile picture
     */
    linkedUser() {
      if (!this.reporter || !this.reporter.linkedId) return
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
    },
    positionOptions() {
      return organizationPositionOptions(this.$store, this.organization)
    }
  },
  fetch(ctx) {
    const { report } = stateFromParams(ctx)
    return ctx.store.dispatch('refresh', { hint: 'only', reports: [report] })
  },
  methods: {
    positionChanged() {
      if (!this.exists) return
      const { position } = this.form
      const { report, reporter } = stateFromParams(vmAsCtx(this))
      const formula = formulaFindById(this.$store, report.formulaId)
      if (!formula || position === reporter.position) {
        this.form.position = reporter.position // can't change if formula missing
        this.reporterOverride = null
        return
      }
      this.reporterOverride = forumulaEnforceEnabledValues(
        formula,
        Object.assign({}, reporter, { position })
      )
    },
    submit() {
      if (this.exists) return this.submitUpdate()
      else return this.submitAdd()
    },
    async submitAdd() {
      try {
        const { name, position } = this.form
        const reporterId = await this.$store.dispatch(
          'reports/reporterCreate',
          {
            reportId: this.report.id,
            name,
            position
          }
        )
        this.$router.replace({
          path: `/reports/daily/${this.report.id}/reporters/${reporterId}`
        })
      } catch (e) {}
    },
    async submitUpdate() {
      try {
        const {
          position,
          hours,
          salesTotal,
          salesExcluded,
          tipsPos,
          tipsCash
        } = this.form
        await this.$store.dispatch('reports/reporterUpdate', {
          reportId: this.report.id,
          reporterId: this.reporter.id,
          position,
          hours,
          salesTotal,
          salesExcluded,
          tipsPos,
          tipsCash
        })
        this.reporterOverride = null
        if (this.reporter.done) this.doneSnackbar = true
      } catch (e) {}
    }
  }
}
</script>
