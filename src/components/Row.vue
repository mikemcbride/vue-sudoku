<template>
  <div class="row">
    <Cell
      v-for="(cell, index) in row"
      :key="index"
      :row="rowIndex"
      :col="index"
      :cell="cell"
      @updated="handleCellUpdated"
    />
  </div>
</template>

<script>
import Cell from './Cell.vue'

export default {
  name: 'Row',
  props: {
    row: {
      type: Array,
      required: true
    },
    rowIndex: {
      type: Number,
      required: true
    }
  },
  components: {
    Cell
  },
  methods: {
    handleCellUpdated(payload) {
      this.$emit('updated', payload)
    }
  }
}
</script>