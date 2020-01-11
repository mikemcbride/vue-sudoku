<template lang="html">
  <div class="import-wrapper">
    <textarea v-model="puzzle" rows="9" placeholder="Import a puzzle. Enter x for empty cells and 1-9 for solved cells."></textarea>
    <div v-if="showError" class="error">{{ errorMessage }}</div>
    <button @click="importPuzzle">Import</button>
  </div>
</template>

<script>
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
    isEmptyCellCharacter(char) {
      return char.toLowerCase() === 'x' || char === '.'
    },
    importPuzzle() {
      let puzzlePieces = this.puzzle.split('').filter(it => {
        // only allow x, period, or numbers 1-9
        if (this.isEmptyCellCharacter(it)) {
          return true
        }
        
        let num = parseInt(it, 10)
        
        if (isNaN(num)) {
          return false
        }

        return 0 < num < 10
      })

      if (puzzlePieces.length !== 81) {
        this.showError = true
        this.errorMessage = 'Import data must have 81 cells containing numbers or x for empty cells.'
      } else {
        let grid = puzzlePieces
          .map(it => {
            if (this.isEmptyCellCharacter(it)) {
              return {
                value: null,
                solved: false,
                possibleValues: [1,2,3,4,5,6,7,8,9]
              }
            } else {
              return {
                value: parseInt(it, 10),
                solved: true,
                possibleValues: []
              }
            }
          })
          .reduce((acc, val, idx) => {
            let row = Math.floor(idx/9)
            val.row = row
            if (acc[row]) {
              val.column = acc[row].length
              acc[row].push(val)
            } else {
              val.column = 0
              acc[row] = [val]
            }
            
            return acc
          }, [])
        
        this.$emit('import', grid)
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