<template>
  <v-form v-model="valid">
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
        <tjs-text-field
          v-model="form.name"
          :readonly="readonly"
          required
          label="nick name"
          hint="the name your team uses like Joe, Mr. Smith, or Hey Boss"
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
        <tjs-select
          v-model="form.position"
          :items="positionOptions"
          :readonly="readonly"
          clearable
          label="position"
          hint="a team role such as bartender or waitress"
          prepend-icon="person_pin_circle"
        />
        <v-list two-line>
          <v-subheader>permissions</v-subheader>
          <tjs-list-tile-checkbox
            v-if="!form.away"
            v-model="form.edit"
            :readonly="readonlyManage"
            label="edit team"
            hint="can make any changes to this team"
          />
          <tjs-list-tile-checkbox
            v-model="form.close"
            :readonly="readonlyManage"
            label="close reports"
            hint="can enter values for other members"
          />
          <tjs-list-tile-checkbox
            v-if="exists"
            v-model="form.away"
            :readonly="readonlyManage"
            label="away or retired"
            hint="not included in new reports"
          />
        </v-list>
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-btn
          :disabled="loading || formUnchanged || !valid"
          :loading="loading"
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
import {
  hasOrganizationEdit,
  organizationFindById,
  organizationIsOnlyLinkedWithEdit,
  organizationPositionOptions
} from '~/helpers/organizations'
import { userOptionFindById } from '~/helpers/users'
import { formUnchanged, formUpdate, vmAsCtx } from '~/helpers/form-validation'
import { loading } from '~/mixins/loading'
import TjsAvatar from '~/components/tjs-avatar'
import TjsListTileCheckbox from '~/components/tjs-list-tile-checkbox'
import TjsSelect from '~/components/tjs-select'
import TjsTextField from '~/components/tjs-text-field'

function buildCode() {
  // http://stackoverflow.com/a/8084248
  const f = () =>
    (Math.random() + 1)
      .toString(36)
      .substr(2, 3)
      .toUpperCase()
  return `${f()}-${f()}`
}

function memberFindById(organization, memberId) {
  return organization.members.find(
    mbr => memberId.toString() === mbr.id.toString()
  )
}

function stateFromParams({ params, store }) {
  const organization = organizationFindById(store, params.organizationId)
  if (!organization) return
  let member = null
  if (params.memberId !== '@new') {
    member = memberFindById(organization, params.memberId)
    if (!member) return
  }
  return { organization, member }
}

export default {
  components: { TjsAvatar, TjsListTileCheckbox, TjsSelect, TjsTextField },
  mixins: [loading],
  validate(ctx) {
    return !!stateFromParams(ctx)
  },
  data() {
    const { member } = stateFromParams(vmAsCtx(this))
    return {
      copySnackbar: false,
      confirmUnlink: false,
      confirmUnmanage: false,
      valid: true,
      form: formUpdate(
        {
          name: null,
          position: null,
          code: null,
          edit: false,
          close: true,
          away: false
        },
        member
      )
    }
  },
  computed: {
    organization() {
      return stateFromParams(vmAsCtx(this)).organization
    },
    member() {
      return stateFromParams(vmAsCtx(this)).member
    },
    exists() {
      return !!this.member
    },
    readonly() {
      return !this.hasMeOrganizationEdit
    },
    formUnchanged() {
      return formUnchanged(this.form, this.member)
    },
    showCode() {
      return (
        this.exists &&
        !this.member.linkedId &&
        this.hasMeOrganizationEdit &&
        !this.member.away && // must save !away before code appears
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
        organizationIsOnlyLinkedWithEdit(this.member, this.organization)
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
      } else return userOptionFindById(this.$store, this.member.linkedId)
    },
    positionOptions() {
      return organizationPositionOptions(this.$store, this.organization)
    }
  },
  methods: {
    askUnlink() {
      if (!this.canUnlink) return
      this.confirmUnlink = true
    },
    async unlinkUser() {
      try {
        const code = buildCode()
        const more = await this.update({ code, linkedId: null })
        this.form.code = code
        if (more === 'unlinkedMe') this.$router.push({ path: `/organizations` })
      } catch (e) {}
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
    async clearCode() {
      try {
        const code = null
        await this.update({ code })
        this.form.code = code
      } catch (e) {}
    },
    async refreshCode() {
      try {
        const code = buildCode()
        await this.update({ code })
        this.form.code = code
      } catch (e) {}
    },
    update(attrs) {
      // parent has catch
      return this.$store.dispatch('organizations/memberUpdate', {
        organizationId: this.organization.id,
        memberId: this.member.id,
        ...attrs
      })
    },
    askSubmit() {
      if (!this.isMe || (this.form.edit && !this.form.away)) {
        return this.submit()
      }
      this.confirmUnmanage = true
    },
    async submit() {
      try {
        const { name, position = null, edit, close, away } = this.form
        if (this.exists) {
          this.update({
            name,
            position,
            edit,
            close,
            away
          })
        } else {
          const code = buildCode()
          const memberId = await this.$store.dispatch(
            'organizations/memberCreate',
            {
              organizationId: this.organization.id,
              name,
              position,
              code,
              edit,
              close,
              away: false
            }
          )
          this.$router.replace({
            path: `/organizations/${this.organization.id}/members/${memberId}`
          })
        }
      } catch (e) {}
    }
  }
}
</script>
