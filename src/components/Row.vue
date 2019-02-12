<template lang="html">
  <div class="row">
    <Cell
      v-for="(cell, index) in cells"
      :key="index"
      :row="row"
      :col="index" />
  </div>
</template>

<script>
import Cell from '@/components/Cell'

export default {
  name: 'Row',
  props: {
    row: {
      type: Number,
      required: true
    }
  },
  components: {
    Cell,
  },
  computed: {
    cells() {
      return this.$store.state.grid[this.row]
    }
  },
}
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  height: 11vw;
  max-height: 40px;
}
</style>