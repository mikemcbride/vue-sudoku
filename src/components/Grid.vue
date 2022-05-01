<template>
  <div class="grid">
    <Row
      v-for="(row, index) in grid"
      :key="index"
      :row="row"
      :row-index="index"
      @updated="handleCellUpdated"
    />
  </div>
</template>

<script>
import Row from './Row.vue'
export default {
  name: 'Grid',
  components: {
    Row
  },
  props: {
    grid: {
      type: Array,
      required: true
    }
  },
  methods: {
    handleCellUpdated(payload) {
      this.$emit('updated', payload)
    }
  }
}
</script>
