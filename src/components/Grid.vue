<template lang="html">
  <div class="grid">
    <Row
      v-for="(row, index) in grid"
      :key="index"
      :row="row"
      :row-index="index" />
  </div>
</template>

<script>
import Row from '@/components/Row'
export default {
  name: 'Grid',
  components: {
    Row,
  },
  props: {
    grid: {
      type: Array,
      required: true
    },
  }
}
</script>

<style lang="scss" scoped>
.grid {
  display: inline-block;
}
</style>