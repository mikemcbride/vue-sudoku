<template lang="html">
  <div :class="{
      'box-top': boxTop,
      'box-bottom': boxBottom,
      'box-right': boxRight,
      'box-left': boxLeft
    }">
    <input
      inputmode="numeric"
      type="text"
      pattern="[1-9]"
      :value="cell.value"
      @input="handleInputChange" />
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
    },
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

<style lang="scss" scoped>
div {
  border: 1px solid #ccc;
  margin: 0 -1px -1px 0;
  max-width: 40px;
  padding: 1px;
  width: 11vw;
  
  &.box-top { border-top: 1px solid #777 }
  &.box-bottom { border-bottom: 1px solid #777 }
  &.box-left { border-left: 1px solid #777 }
  &.box-right { border-right: 1px solid #777 }
}
input {
  border: 1px solid transparent;
  border-radius: 0;
  font-size: 18px;
  height: 100%;
  padding: 0;
  text-align: center;
  width: 100%;
  
  &:focus {
    border-color: dodgerblue;
    outline: none;
  }
}
</style>
