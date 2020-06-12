<template>
  <div
    class="cell"
    :class="{
      'box-top': boxTop,
      'box-bottom': boxBottom,
      'box-right': boxRight,
      'box-left': boxLeft
    }"
  >
    <input
      inputmode="numeric"
      type="text"
      pattern="[1-9]"
      :value="cell.value"
      @input="handleInputChange"
    />
  </div>
</template>

<script>
export default {
  name: 'Cell',
  props: {
    cell: {
      type: Object,
      required: true
    },
    col: {
      type: Number,
      required: true
    },
    row: {
      type: Number,
      required: true
    }
  },
  computed: {
    boxLeft() {
      return this.col % 3 === 0
    },
    boxRight() {
      return this.col === 8
    },
    boxBottom() {
      return this.row === 8
    },
    boxTop() {
      return this.row % 3 === 0
    }
  },
  methods: {
    handleInputChange(e) {
      let newVal = parseInt(e.target.value, 10)

      if (isNaN(newVal)) {
        newVal = null
      }

      this.$emit('updated', {
        val: newVal,
        row: this.row,
        col: this.col
      })
    }
  }
}
</script>