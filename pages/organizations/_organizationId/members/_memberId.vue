<template>
  <v-form>
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
          :append-icon="form.code ? 'clear' : null"
          append-outer-icon="cached"
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
          v-if="!form.terminated"
          v-model="form.manager"
          label="can edit team"
          :readonly="readonlyManage"
        />
        <v-switch
          v-if="exists"
          v-model="form.terminated"
          label="terminated or retired"
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

function organizationFindLinkedManagers(organization) {
  return organization.members.filter(mbr => mbr.manager && mbr.linkedId)
}

function isOrganizationManager(userId, organization) {
  return organization.members.find(
    mbr => mbr.manager && mbr.linkedId === userId
  )
}

const nuxtPageNotFound = {
  statusCode: 404,
  message: 'This page could not be found'
}

export default {
  components: { TjsAvatar },
  data: () => ({
    confirmUnlink: false,
    confirmUnmanage: false,
    organization: null,
    member: null,
    form: {
      name: null,
      position: null,
      code: null,
      manager: false,
      terminated: false
    }
  }),
  computed: {
    exists() {
      return !!this.member
    },
    readonly() {
      return !this.isMeOrganizationManager
    },
    formUnchanged() {
      // note: code is immediate, so not here
      const { name, position, manager, terminated } = this.member || {}
      return (
        this.form.name === name &&
        this.form.position === position &&
        this.form.manager === manager &&
        this.form.terminated === terminated
      )
    },
    formInvalid() {
      return !this.form.name || !this.form.position
    },
    showCode() {
      return (
        this.exists &&
        !this.member.linkedId &&
        this.isMeOrganizationManager &&
        !this.form.terminated
      )
    },
    isMeOrganizationManager() {
      return isOrganizationManager(this.$store.state.me.id, this.organization)
    },
    isMe() {
      return this.exists && this.member.linkedId === this.$store.state.me.id
    },
    isOnlyLinkedManager() {
      return (
        this.exists &&
        this.member.manager &&
        this.member.linkedId &&
        organizationFindLinkedManagers(this.organization).length < 2
      )
    },
    /**
     * can unlink self even if not manager unless self is only manager
     * can unlink anybody if is manager
     */
    canUnlink() {
      return !this.isOnlyLinkedManager && (this.isMe || !this.readonly)
    },
    /**
     * can remove manage only if editing allowed and not only
     */
    readonlyManage() {
      if (this.readonly) return true
      return !(
        !this.exists ||
        !this.member.manager ||
        !this.isOnlyLinkedManager
      )
    },
    /**
     * can never terminat any manager
     */
    readonlyTerminate() {
      return this.readonlyManage || this.form.manager
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
      const { name, position, code, manager, terminated } = member
      return {
        organization,
        member,
        form: { name, position, code, manager, terminated }
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
      if (!this.isMe || (this.form.manager && !this.form.terminated)) {
        return this.submit()
      }
      this.confirmUnmanage = true
    },
    submit() {
      const { name, position, manager, terminated } = this.form
      if (this.exists) {
        this.update({
          name,
          position,
          manager,
          terminated
        })
      } else {
        const code = buildCode()
        this.$store.commit('organizations/memberCreate', {
          organizationId: this.organization.id,
          name,
          position,
          code,
          manager
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
