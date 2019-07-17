<template lang="html">
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
import Cell from '@/components/Cell'

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

<style lang="scss" scoped>
.row {
  display: flex;
  height: 11vw;
  max-height: 40px;
}
</style>
