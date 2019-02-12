<template lang="html">
  <div class="grid">
    <Row
      v-for="(row, index) in grid"
      :key="index"
      :row="index" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Row from '@/components/Row'

export default {
  name: 'Grid',
  components: {
    Row,
  },
  computed: {
    ...mapState(['grid'])
  }
}
</script>

<style lang="scss" scoped>
.grid {
  display: inline-block;
}
</style>