<template>
  <div class="home">
    <section>
      <div>
        <Grid :grid="grid" @updated="setCell" />
      </div>
      <p>Calculations required: {{ calculations }}</p>
      <p>Time to solve: {{ solveTime }}</p>
      <button @click="solve">Solve</button>
      <button @click="clear">Clear Puzzle</button>
    </section>

    <aside>
      <h3>Prefill a puzzle:</h3>
      <button @click="loadPuzzle('easy')">Easy Puzzle</button>
      <button @click="loadPuzzle('medium')">Medium Puzzle</button>
      <button @click="loadPuzzle('hard')">Hard Puzzle</button>
      <button @click="loadPuzzle('evil')">Evil Puzzle</button>
      <button @click="loadPuzzle('hardest')">World's Hardest Sudoku</button>
      <a href="https://gizmodo.com/can-you-solve-the-10-hardest-logic-puzzles-ever-created-1064112665" target="_blank">Worlds Hardest Sudoku according to this article</a>
    </aside>
  </div>
</template>

<script>
import defaultGrid from '@/lib/defaultGrid'
import deepClone from '@/lib/deepClone'
import puzzles from '@/lib/puzzles'
import Grid from '@/components/Grid'

// we will use these arrays to quickly map through all row and column indices
const range = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const allPossibleCellValues = range.map(it => it + 1)

export default {
  name: 'Home',
  components: {
    Grid
  },
  data() {
    return {
      grid: deepClone(defaultGrid),
      calculations: 0,
      snapshots: [],
      solveTime: 0,
      startTime: 0
    }
  },
  methods: {
    isSolved() {
      // yes, this could be a computed property but the values in the grid will be changing frequently during
      // the solve cycle and we really only need to check the value of this at two points. it's more
      // efficient to simply execute this method instead of having it constantly update itself so we can reference it.
      for (let row of this.grid) {
        const unsolvedCells = row.filter(cell => cell.solved !== true)
        if (unsolvedCells.length > 0) {
          // we have unsolved cells in this row
          return false
        }
      }
      // we made it to the end and all cells are solved
      return true
    },

    getPossibleCellValues(row, col) {
      // get an array of values for each cell in the current row, column, and square
      const rowVals = this.getCellsInRow(row)
        .filter(it => it.solved)
        .map(it => it.value)
      const columnVals = this.getCellsInColumn(col)
        .filter(it => it.solved)
        .map(it => it.value)
      const squareVals = this.getCellsInSquare(row, col)
        .filter(it => it.solved)
        .map(it => it.value)

      // make a unique list of the above values
      const allVals = new Set([...rowVals, ...columnVals, ...squareVals])

      // return a filtered list that excludes the solved values from the set above
      return allPossibleCellValues.filter(it => allVals.has(it) === false)
    },
    getCellsInRow(row) {
      return range.map(col => this.grid[row][col])
    },
    getCellsInColumn(col) {
      return range.map(row => this.grid[row][col])
    },
    getCellsInSquare(row, col) {
      let cells = []
      // Math FTW! row - row % 3 will give us the starting index of the current box,
      // so we can get the rows of this box by adding 0, 1, and 2 to that value.
      let rows = [0, 1, 2].map(r => r + (row - (row % 3)))
      let cols = [0, 1, 2].map(c => c + (col - (col % 3)))

      rows.forEach(row => {
        cols.forEach(column => {
          cells.push(this.grid[row][column])
        })
      })

      return cells
    },

    async solve() {
      this.solveTime = 0
      this.startTime = Date.now()

      if (this.isSolved() === false) {
        await this.makePass()
      }
    },
    loadPuzzle(level) {
      let puzzle = deepClone(puzzles[level].grid)
      this.SET_GRID(puzzle)
      this.SET_CALCULATIONS(0)
      this.solveTime = 0
    },
    clear() {
      let grid = deepClone(defaultGrid)
      this.SET_GRID(grid)
      this.SET_CALCULATIONS(0)
      this.solveTime = 0
    },

    SET_CELL({ row, col, cell }) {
      this.grid[row][col] = cell
    },
    SET_CELL_VALUE({ row, col, val }) {
      this.grid[row][col].value = val
    },
    SET_CELL_SOLVED({ row, col, val }) {
      this.grid[row][col].solved = val
    },
    ADD_SNAPSHOT(grid) {
      this.snapshots = [...this.snapshots, grid]
    },
    REVERT_SNAPSHOT() {
      const snapshots = deepClone(this.snapshots)
      this.grid = snapshots.pop() // take the latest snapshot
      this.snapshots = snapshots // set the rest to snapshots
    },
    SET_GRID(grid) {
      this.grid = grid
    },
    SET_CALCULATIONS(val) {
      this.calculations = val
    },
    INCREMENT_CALCULATIONS() {
      this.calculations += 1
    },

    setCell({ val, row, col }) {
      // this only gets triggered when the user manually updates the value,
      // so we can assume that the cell is solved.
      const cell = {
        value: val,
        solved: val === null ? false : true,
        possibleValues: val === null ? [...allPossibleCellValues] : []
      }

      this.SET_CELL({ row, col, cell })
    },
    async makePass() {
      let hasUpdatedValues = false
      let hasReverted = false

      // pass through each cell and check for possible values
      // if it only has one possible, set it and mark it solved
      // otherwise, just update possible values and move on
      outer_loop: for (let row in this.grid) {
        let gridRow = this.grid[row]
        for (let col in gridRow) {
          let cell = this.grid[row][col]

          if (cell.solved === false) {
            if (cell.possibleValues.length === 0) {
              // we ran out of options here. We need to revert one more snapshot back before proceeding.
              this.REVERT_SNAPSHOT()
              this.INCREMENT_CALCULATIONS()
              hasReverted = true
              break outer_loop
            }

            let possibleValues = this.getPossibleCellValues(row, col)
            this.INCREMENT_CALCULATIONS()

            if (possibleValues.length === 0) {
              // no possible values, this attempt is not correct. bail.
              this.REVERT_SNAPSHOT()
              this.INCREMENT_CALCULATIONS()
              hasReverted = true
              break outer_loop
            }

            if (possibleValues.length < cell.possibleValues.length) {
              // this is a situation we can get ourselves in when reverting a snapshot.
              // if we have eliminated some possible values by trying them, we shouldn't
              // revert that knowledge. Only update cell.possibleValues if it benefits us.
              hasUpdatedValues = true
              cell.possibleValues = possibleValues
              this.INCREMENT_CALCULATIONS()
            }

            if (cell.possibleValues.length === 1) {
              cell.solved = true
              cell.value = cell.possibleValues[0]
              this.INCREMENT_CALCULATIONS()
            }
          }
        }
      }

      if (hasUpdatedValues === false && hasReverted === false) {
        // we made it through without updating anything, start making assumptions.
        // find the first unsolved cell, try the first possible value, and take a snapshot.
        outer_loop: for (let row in this.grid) {
          for (let col in this.grid[row]) {
            let cell = this.grid[row][col]

            this.INCREMENT_CALCULATIONS()

            if (cell.solved === false) {
              // grab first item in possible values, and remove it from the array
              let testVal = cell.possibleValues.shift()

              // take a snapshot NOW, so before we update the cell but after we've removed one possible value.
              // this will ensure we don't ever repeat checks but still test all cells properly.
              // also make sure we do a deep copy of the grid, so we don't retain object references
              const snapshot = deepClone(this.grid)
              this.ADD_SNAPSHOT(snapshot)
              this.INCREMENT_CALCULATIONS()

              // now update our value and solved
              this.SET_CELL_VALUE({ row, col, val: testVal })
              this.SET_CELL_SOLVED({ row, col, val: true })
              this.INCREMENT_CALCULATIONS()

              break outer_loop
            }
          }
        }
      }

      if (this.isSolved() === false) {
        await setTimeout(() => {
          this.makePass()
        }, 0)
      } else {
        let finish = Date.now() - this.startTime
        this.solveTime = `${finish / 1000}s`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  text-align: center;
  display: flex;
  flex-direction: column;

  @media all and (min-width: 768px) {
    flex-direction: row-reverse;

    section {
      flex: 1;
    }
  }

  > div {
    margin-bottom: 2rem;
  }
}

textarea {
  background: #f5f6f7;
  border: 1px solid #ccc;
  border-radius: 0;
  font-family: monospace;
  font-size: 16px;
  max-width: 400px;
  resize: vertical;
  padding: 0.5rem;
  width: 100%;

  &:focus {
    border-color: #0074d9;
    outline: none;
  }
}

button {
  border: none;
  background: dodgerblue;
  color: white;
  cursor: pointer;
  display: block;
  font-size: 18px;
  margin: 1rem auto;
  padding: 6px 10px;
  width: 300px;

  &:hover {
    background: #0074d9;
  }
}

a {
  color: #0074d9;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

section {
  margin-bottom: 4rem;
}
</style>
