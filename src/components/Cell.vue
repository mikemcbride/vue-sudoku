<template lang="html">
  <div :class="{
      'box-top': boxTop,
      'box-bottom': boxBottom,
      'box-right': boxRight,
      'box-left': boxLeft
    }">
    <input inputmode="numeric" type="text" pattern="[0-9]*" v-model="cell" />
  </div>
</template>

<script>
export default {
  name: 'Cell',
  props: {
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
    cell: {
      get() {
        return this.$store.state.grid[this.row][this.col].value
      },
      set(val) {
        const payload = {
          val,
          row: this.row,
          col: this.col
        }
        this.$store.dispatch('setCell', payload)
      }
    },
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
