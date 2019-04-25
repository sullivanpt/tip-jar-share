<template>
  <v-container pa-0 grid-list-md>
    <v-layout column>
      <v-flex>
        <v-card>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="team name"
              :readonly="readonly"
            />
            <v-text-field
              v-model="avatar"
              label="avatar URL"
              :readonly="readonly"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn :disabled="formInvalid" @click="submit">submit</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex>
        <v-card>
          <v-card-title>
            <span class="headline">staff members</span>
            <v-spacer />
            <v-btn title="add" fab small color="primary">
              <v-icon>add</v-icon>
            </v-btn>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
              clearable
            />
          </v-card-title>
          <v-data-table
            :headers="[
              { text: 'name', value: 'name' },
              { text: 'position', value: 'position' },
              { text: 'is manager', value: 'manager' },
              { text: 'join code', value: 'code' },
              { text: 'options', sortable: false, align: 'right' }
            ]"
            :items="members"
            :search="search"
          />
        </v-card>
      </v-flex>

      <v-flex>
        <v-card>
          <v-card-title>
            <span class="headline">staff positions</span>
            <v-spacer />
            <v-btn title="add" fab small color="primary">
              <v-icon>add</v-icon>
            </v-btn>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
              clearable
            />
          </v-card-title>
          <v-data-table
            :headers="[
              { text: 'position', value: 'position' },
              { text: 'allocation rule', value: 'rule' },
              { text: 'options', sortable: false, align: 'right' }
            ]"
            :items="positions"
            :search="search"
          />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    search: null,
    // TODO: edit mode
    name: null,
    avatar: null
  }),
  computed: {
    readonly() {
      return false
    },
    formInvalid() {
      return !this.name
    },
    members() {
      return []
    },
    positions() {
      return []
    }
  },
  methods: {
    submit() {
      // TODO: edit mode
      this.$store.commit('organizations/create', {
        name: this.name,
        avatar: this.avatar
      })
    }
  }
}
</script>
