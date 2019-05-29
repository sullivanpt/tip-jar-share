<template>
  <v-data-table
    :pagination.sync="pagination"
    :headers="[
      { text: '% CC and POS tips', value: 'tipsPosPercent' },
      { text: '% cash tips', value: 'tipsCashPercent' },
      { text: 'destination', value: 'position' }
    ]"
    :items="items"
  >
    <template v-slot:items="props">
      <tr>
        <td>
          <span v-if="readonly">
            {{ props.item.tipsPosPercent | formatPercent }}
          </span>
          <v-edit-dialog
            v-else
            :return-value.sync="props.item.tipsPosPercent"
            lazy
            @save="save"
          >
            <span>{{ props.item.tipsPosPercent | formatPercent }}</span>
            <template v-slot:input>
              <tjs-text-percent
                v-model="props.item.tipsPosPercent"
                label="% of CC and POS tip pool"
                hint="transfer some of this postion's CC and POS tip pool to another postion's tip pool"
                clearable
                autofocus
              />
            </template>
          </v-edit-dialog>
        </td>
        <td>
          <span v-if="readonly">
            {{ props.item.tipsCashPercent | formatPercent }}
          </span>
          <v-edit-dialog
            v-else
            :return-value.sync="props.item.tipsCashPercent"
            lazy
            @save="save"
          >
            <span>{{ props.item.tipsCashPercent | formatPercent }}</span>
            <template v-slot:input>
              <tjs-text-percent
                v-model="props.item.tipsCashPercent"
                label="% of cash tip pool"
                hint="transfer some of this postion's cash tip pool to another postion's tip pool"
                clearable
                autofocus
              />
            </template>
          </v-edit-dialog>
        </td>
        <td>
          {{ props.item.position || props.item.missing }}
          <v-icon v-if="props.item.missing" @click="clean">delete</v-icon>
        </td>
      </tr>
    </template>

    <template v-slot:footer>
      <tr class="totals">
        <td :class="{ error: totals.tipsPosPercentOver }">
          {{ totals.tipsPosPercent | formatPercent }}
          <v-icon v-if="totals.tipsPosPercentOver">warning</v-icon>
        </td>
        <td :class="{ error: totals.tipsCashPercentOver }">
          {{ totals.tipsCashPercent | formatPercent }}
          <v-icon v-if="totals.tipsCashPercentOver">warning</v-icon>
        </td>
        <td>totals</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import {
  fromPercent,
  formatPercent,
  isZero,
  totalPercent
} from '~/helpers/math.js'
import TjsTextPercent from '~/components/tjs-text-percent'

/**
 * build items from both transfers and otherPositionOptions
 * [{ id or negative number, allocationId, position or allocationIdString, tipsPosPercent, tipsCashPercent }]
 */
function buildItems(transfers, otherPositionOptions) {
  const r = otherPositionOptions.map((opt, idx) => {
    const { id = -(idx + 1), tipsPosPercent = null, tipsCashPercent = null } =
      transfers.find(trn => trn.allocationId === opt.value) || {}
    return {
      id,
      allocationId: opt.value,
      position: opt.text,
      tipsPosPercent,
      tipsCashPercent,
      missing: null
    }
  })
  // add back any ostracized transfers
  transfers.forEach(trn => {
    if (!r.find(itm => itm.id === trn.id)) {
      r.push({
        ...trn,
        position: null,
        missing: `#${trn.allocationId}`
      })
    }
  })
  return r
}

/**
 * one stage of transfer pools between positions
 */
export default {
  components: { TjsTextPercent },
  filters: { formatPercent },
  model: { prop: 'transfers', event: 'update:transfers' },
  props: {
    // [{ id: 't-id', allocationId: 'alc-id', tipsPosPercent: '10', tipsCashPercent: '15' }]
    // warning: allocationId may refer to a deleted entry
    transfers: { type: Array, default: () => [] },
    // [{ text: allocations[].position, value: allocations[].id }]
    otherPositionOptions: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false }
  },
  data: () => ({
    pagination: { sortBy: 'position' },
    items: []
  }),
  computed: {
    totals() {
      const r = {
        tipsPosPercent: totalPercent(this.items, 'tipsPosPercent'),
        tipsCashPercent: totalPercent(this.items, 'tipsCashPercent')
      }
      r.tipsPosPercentOver = fromPercent(r.tipsPosPercent).gt(1)
      r.tipsCashPercentOver = fromPercent(r.tipsCashPercent).gt(1)
      return r
    }
  },
  watch: {
    // note: we don't expect otherPositionOptions to change while we are open
    transfers: {
      handler() {
        this.items = buildItems(this.transfers, this.otherPositionOptions)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    /**
     * when we update
     * - optionally strip ostrasized positions
     * - strip 0 value entries
     *
     * note: stripping and updating at same time causes edited value to go in wrong row
     */
    update(noStrip) {
      const newValue = this.items.reduce((acc, itm) => {
        const {
          id,
          position,
          allocationId,
          tipsPosPercent,
          tipsCashPercent
        } = itm
        if (
          (position || noStrip) &&
          !(isZero(tipsPosPercent) && isZero(tipsCashPercent))
        ) {
          acc.push({
            id: id < 0 ? null : id, // assumes real id not of form '-1'
            allocationId,
            tipsPosPercent,
            tipsCashPercent
          })
        }
        return acc
      }, [])
      this.$emit('update:transfers', newValue)
    },
    save() {
      this.update(true)
    },
    clean() {
      this.update(false)
    }
  }
}
</script>

<style>
.totals {
  background-color: #3c3c3c; /* TODO: better color */
  font-weight: bold;
}
</style>
