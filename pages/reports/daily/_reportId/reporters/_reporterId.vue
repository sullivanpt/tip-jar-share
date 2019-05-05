<template>
  <v-form>
    <v-card>
      <v-card-title class="headline" v-text="reportDateFriendly"></v-card-title>
      <v-card-text>
        <v-text-field
          :value="reporter.name"
          :hint="linkedUser ? linkedUser.text : null"
          :append-icon="linkedUser ? 'link' : null"
          :readonly="readonly"
          persistent-hint
          label="nick name"
        >
          <template v-slot:prepend>
            <tjs-avatar :size="32" :item="linkedUser" />
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script>
import { nuxtPageNotFound } from '~/helpers/nuxt'
import { reportFindById } from '~/helpers/reports'
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
    report: null,
    reporter: null
  }),
  computed: {
    readonly() {
      return true // TODO: something
    },
    reportDateFriendly() {
      return formatDate(this.report.date)
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
    return {
      report,
      reporter
    }
  }
}
</script>
