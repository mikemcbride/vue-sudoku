<template>
  <div class="import-wrapper">
    <textarea v-model="puzzle" rows="9" placeholder="Import a puzzle. Enter x for empty cells and 1-9 for solved cells."></textarea>
    <div v-if="showError" class="error">{{ errorMessage }}</div>
    <button @click="importPuzzle">Import</button>
  </div>
</template>

<script>
import parsePuzzle from '../lib/parsePuzzle.js'

export default {
  name: 'ImportPuzzle',
  data() {
    return {
      puzzle: '',
      errorMessage: '',
      showError: false
    }
  },
  methods: {
    importPuzzle() {
      const result = parsePuzzle(this.puzzle)
      if (result.error) {
        this.showError = true
        this.errorMessage = result.message
      } else {
        this.$emit('import', result)
      }
    }
  },
}
</script>