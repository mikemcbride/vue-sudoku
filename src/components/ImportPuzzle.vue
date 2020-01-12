<template lang="html">
  <div class="import-wrapper">
    <textarea v-model="puzzle" rows="9" placeholder="Import a puzzle. Enter x for empty cells and 1-9 for solved cells."></textarea>
    <div v-if="showError" class="error">{{ errorMessage }}</div>
    <button @click="importPuzzle">Import</button>
  </div>
</template>

<script>
import parsePuzzle from '@/lib/parsePuzzle'

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

<style lang="scss" scoped>
.import-wrapper {
  margin: 1rem 0;
}

.error {
  margin-bottom: 1rem;
  color: crimson;
}

textarea {
  resize: vertical;
  width: 300px;
  margin: 0 auto 1rem;
  font-size: 1rem;
  padding: 4px 6px;
  border: 1px solid gainsboro;
}

button {
  border: none;
  background: dodgerblue;
  color: white;
  cursor: pointer;
  display: block;
  font-size: 18px;
  margin: 0 auto 1rem;
  padding: 6px 10px;
  width: 300px;

  &:hover {
    background: #0074d9;
  }
}
</style>