<template>
  <v-layout column>
    <v-flex>
      <tjs-organization-select />
    </v-flex>
    <v-flex text-xs-center>
      <blockquote class="blockquote">
        &#8220;First, solve the problem. Then, write the code.&#8221;
        <footer>
          <small>
            <em>&mdash;John Johnson</em>
          </small>
        </footer>
      </blockquote>
    </v-flex>
  </v-layout>
</template>

<script>
import TjsOrganizationSelect from '~/components/tjs-organization-select.vue'

export default {
  components: {
    TjsOrganizationSelect
  }
}
</script>
