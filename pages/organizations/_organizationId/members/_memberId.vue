<template>
  <v-form>
    <v-snackbar v-model="copySnackbar" color="success">
      <div>team code copied to clipboard</div>
      <v-btn flat @click.native="copySnackbar = false">Close</v-btn>
    </v-snackbar>

    <v-dialog v-model="confirmUnlink">
      <v-card>
        <v-card-text v-if="isMe">
          If you unlink yourself you may lose access to this team. Are you sure
          you want to unlink this team member from your website user?
        </v-card-text>
        <v-card-text v-else>
          Are you sure you want to unlink this team member from this website
          user?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click.prevent="confirmUnlink = false">cancel</v-btn>
          <v-btn
            color="error"
            @click.prevent="
              confirmUnlink = false
              unlinkUser()
            "
            >confirm</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmUnmanage">
      <v-card>
        <v-card-text>
          You will no longer be able to edit this team. Please confirm you want
          to remove edit permission from yourself.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click.prevent="confirmUnmanage = false">cancel</v-btn>
          <v-btn
            color="error"
            @click.prevent="
              confirmUnmanage = false
              submit()
            "
            >confirm</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-text>
        <v-text-field
          v-model="form.name"
          label="nick name"
          hint="the name your team uses like Joe, Mr. Smith, or Hey Boss"
          :readonly="readonly"
        />
        <v-text-field
          v-if="showCode"
          :value="form.code"
          label="team code"
          :hint="
            form.code
              ? 'give this to your new team member so they can join the website and enter their hours'
              : 'managers enter hours for unlinked team members'
          "
          readonly
          :prepend-icon="form.code ? 'file_copy' : null"
          :append-icon="form.code ? 'clear' : null"
          append-outer-icon="cached"
          @click:prepend="copyCode"
          @click:append="clearCode"
          @click:append-outer="refreshCode"
        />
        <!-- show actual user name and icon here -->
        <v-text-field
          v-if="linkedUser"
          :value="linkedUser.text"
          :label="
            isMe
              ? 'you are this team member'
              : 'website user for this team member'
          "
          :append-icon="canUnlink ? 'link_off' : 'link'"
          readonly
          @click:append="askUnlink"
        >
          <template v-slot:prepend>
            <tjs-avatar :size="32" :item="linkedUser" />
          </template>
        </v-text-field>
        <v-select
          v-model="form.position"
          :items="positionOptions"
          label="position"
          hint="a team role such as bartender or waitress"
          :readonly="readonly"
        />
        <v-switch
          v-if="!form.away"
          v-model="form.edit"
          label="can edit team"
          :readonly="readonlyManage"
        />
        <v-switch
          v-if="exists"
          v-model="form.away"
          label="away or retired"
          :readonly="readonlyManage"
        />
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="formInvalid || formUnchanged"
          type="submit"
          @click.prevent="askSubmit"
          >submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import copyTextToClipboard from 'copy-text-to-clipboard'
import { getBrowserOrigin } from '~/helpers/browser'
import { applicationTitle } from '~/helpers/site-map'
import TjsAvatar from '~/components/tjs-avatar'

function buildCode() {
  // http://stackoverflow.com/a/8084248
  const f = () =>
    (Math.random() + 1)
      .toString(36)
      .substr(2, 5)
      .toUpperCase()
  return `${f()}-${f()}`
}

function organizationFindById(store, organizationId) {
  return store.state.organizations.organizations.find(
    org => organizationId.toString() === org.id.toString()
  )
}

function memberFindById(organization, memberId) {
  return organization.members.find(
    mbr => memberId.toString() === mbr.id.toString()
  )
}

function organizationFindLinkedWithEdit(organization) {
  return organization.members.filter(mbr => mbr.edit && mbr.linkedId)
}

function hasOrganizationEdit(userId, organization) {
  return organization.members.find(mbr => mbr.edit && mbr.linkedId === userId)
}

const nuxtPageNotFound = {
  statusCode: 404,
  message: 'This page could not be found'
}

export default {
  components: { TjsAvatar },
  data: () => ({
    copySnackbar: false,
    confirmUnlink: false,
    confirmUnmanage: false,
    organization: null,
    member: null,
    form: {
      name: null,
      position: null,
      code: null,
      edit: false,
      away: false
    }
  }),
  computed: {
    exists() {
      return !!this.member
    },
    readonly() {
      return !this.hasMeOrganizationEdit
    },
    formUnchanged() {
      // note: code is immediate, so not here
      const { name, position, edit, away } = this.member || {}
      return (
        this.form.name === name &&
        this.form.position === position &&
        this.form.edit === edit &&
        this.form.away === away
      )
    },
    formInvalid() {
      return !this.form.name || !this.form.position
    },
    showCode() {
      return (
        this.exists &&
        !this.member.linkedId &&
        this.hasMeOrganizationEdit &&
        !this.form.away
      )
    },
    hasMeOrganizationEdit() {
      return hasOrganizationEdit(this.$store.state.me.id, this.organization)
    },
    isMe() {
      return this.exists && this.member.linkedId === this.$store.state.me.id
    },
    isOnlyLinkedWithEdit() {
      return (
        this.exists &&
        this.member.edit &&
        this.member.linkedId &&
        organizationFindLinkedWithEdit(this.organization).length < 2
      )
    },
    /**
     * can unlink self even if not edit unless self is only with edit
     * can unlink anybody if is has edit
     */
    canUnlink() {
      return !this.isOnlyLinkedWithEdit && (this.isMe || !this.readonly)
    },
    /**
     * can remove manage only if editing allowed and not only
     */
    readonlyManage() {
      if (this.readonly) return true
      return !(!this.exists || !this.member.edit || !this.isOnlyLinkedWithEdit)
    },
    /**
     * can never terminate any with edit
     */
    readonlyTerminate() {
      return this.readonlyManage || this.form.edit
    },
    /**
     * if the user is linked show it's gravatar,
     * except for logged in user sees profile picture
     */
    linkedUser() {
      if (!this.exists || !this.member.linkedId) return
      if (this.member.linkedId === this.$store.state.me.id) {
        return {
          text: this.$auth.user ? this.$auth.user.name : '',
          avatar: this.$auth.user ? this.$auth.user.picture : ''
        }
      } else {
        return {
          text: `name for ${this.member.linkedId}`
          // TODO: linked user gravatar
        }
      }
    },
    positionOptions() {
      return this.organization.positions
        .map(pos => pos.name)
        .concat('unassigned')
    }
  },
  asyncData({ error, params, store }) {
    // TODO: await store.dispatch('organizations/load')
    const organization = organizationFindById(store, params.organizationId)
    if (!organization) {
      return error(nuxtPageNotFound)
    }
    if (params.memberId !== '@new') {
      const member = memberFindById(organization, params.memberId)
      if (!member) {
        return error(nuxtPageNotFound)
      }
      const { name, position, code, edit, away } = member
      return {
        organization,
        member,
        form: { name, position, code, edit, away }
      }
    }
    return { organization }
  },
  methods: {
    askUnlink() {
      if (!this.canUnlink) return
      this.confirmUnlink = true
    },
    unlinkUser() {
      const wasMe = this.isMe
      const code = buildCode()
      this.update({ code, linkedId: null })
      this.form.code = code
      if (wasMe) {
        // TODO: fix this -- simulates losing access
        this.$store.commit('organizations/delete', { id: this.organization.id })
        this.$router.push({ path: `/organizations` })
      }
    },
    copyCode() {
      const href = `${getBrowserOrigin()}/?code=${this.form.code}`
      const success = copyTextToClipboard(
        `You are invited to join ${
          this.organization.name
        } on ${applicationTitle}.
Open the URL below, sign in, then your enter your "team code" ${this.form.code}.

The URL is ${href}`
      )
      if (success) this.copySnackbar = true
    },
    clearCode() {
      const code = null
      this.update({ code })
      this.form.code = code
    },
    refreshCode() {
      const code = buildCode()
      this.update({ code })
      this.form.code = code
    },
    update(attrs) {
      this.$store.commit('organizations/memberUpdate', {
        organizationId: this.organization.id,
        id: this.member.id,
        ...attrs
      })
    },
    askSubmit() {
      if (!this.isMe || (this.form.edit && !this.form.away)) {
        return this.submit()
      }
      this.confirmUnmanage = true
    },
    submit() {
      const { name, position, edit, away } = this.form
      if (this.exists) {
        this.update({
          name,
          position,
          edit,
          away
        })
      } else {
        const code = buildCode()
        this.$store.commit('organizations/memberCreate', {
          organizationId: this.organization.id,
          name,
          position,
          code,
          edit
        })
        // TODO: redirect to new ID using dispatch
        const newId = this.organization.members.slice(-1)[0].id
        this.$router.replace({
          path: `/organizations/${this.organization.id}/members/${newId}`
        })
      }
    }
  }
}
</script>
