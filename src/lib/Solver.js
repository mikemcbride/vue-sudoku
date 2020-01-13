import klona from 'klona'
import uniqBy from 'uniq-by'

// we will use these arrays to quickly map through all row and column indices
const range = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const allPossibleCellValues = range.map(it => it + 1)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default class Solver {
  constructor(grid = []) {
    this.grid = grid
    this.calculations = 0
    this.snapshots = []
    this.startTime = 0
    this.finishTime = 0
    this.detours = []
  }

  start() {
    this.snapshots = []
    this.detours = []
    this.startTime = Date.now()
  }

  done() {
    this.snapshots = []
    this.detours = []
    this.finishTime = Date.now()
  }

  get solveTime() {
    if (!this.isSolved) {
      return `0s`
    }

    return `${(this.finishTime - this.startTime) / 1000}s`
  }

  get isSolved() {
    return this.getFlattenedGrid().every(cell => cell.solved === true)
  }

  getPossibleCellValues(row, col) {
    const allVals = new Set(this.getRelatedSolvedCells(row, col).map(it => it.value))
    // return a filtered list that excludes the solved values from the set above
    return allPossibleCellValues.filter(it => !allVals.has(it))
  }

  getCellsInRow(row) {
    return range.map(col => this.grid[row][col])
  }

  getCellsInColumn(col) {
    return range.map(row => this.grid[row][col])
  }

  getCellsInSquare(row, col) {
    let cells = []
    // Math FTW! row - row % 3 will give us the starting index of the current box,
    // so we can get the rows of this box by adding 0, 1, and 2 to that value.
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    let rows = [0, 1, 2].map(r => r + startRow)
    let cols = [0, 1, 2].map(c => c + startCol)

    for (let row of rows) {
      for (let column of cols) {
        cells.push(this.grid[row][column])
      }
    }

    return cells
  }

  getRelatedCells(row, col) {
    const thisCellId = `${row}.${col}`
    return uniqBy([
      ...this.getCellsInColumn(col),
      ...this.getCellsInRow(row),
      ...this.getCellsInSquare(row, col)
    ], 'id').filter(it => it.id !== thisCellId)
  }

  getRelatedUnsolvedCells(row, col) {
    return this.getRelatedCells(row, col).filter(it => !it.solved)
  }

  getRelatedSolvedCells(row, col) {
    return this.getRelatedCells(row, col).filter(it => it.solved === true)
  }

  getAllUnsolvedCells() {
    return this.getFlattenedGrid().filter(it => it.solved === false)
  }

  getOptimalGuessCell() {
    // we try to find the unsolved cell with the fewest possible values remaining
    return this.getAllUnsolvedCells().reduce((best, current, i, arr) => {
      if (current.length === 2) {
        // we won't find a value lower than 2, eject early
        arr.splice(i)
        return current
      }
      return current.possibleValues.length < best.possibleValues.length ? current : best
    }, { possibleValues: { length: Infinity }})
  }

  setCell({ val, row, col }) {
    // this only gets triggered when the user manually updates the value,
    // so we can assume that the cell is solved.
    const cell = {
      value: val,
      solved: val === null ? false : true,
      possibleValues: val === null ? [...allPossibleCellValues] : [],
      row: row, 
      column: col,
      id: `${row}.${col}`
    }
    this.grid[row][col] = cell
  }

  addSnapshot(grid) {
    this.snapshots = [...this.snapshots, grid]
  }

  revertSnapshot() {
    this.grid = this.snapshots.pop() // take the latest snapshot
  }

  incrementCalculations() {
    this.calculations += 1
  }

  setDetoursForSolvedCell({ row, column }) {
    const unsolved = this.getRelatedUnsolvedCells(row, column)

    for (let cell of unsolved) {
      const isInDetours = this.detours.some(it => it.id === cell.id)

      // we know the value of the solved cell, so update this cell's possible values to remove it.
      cell.possibleValues = this.getPossibleCellValues(cell.row, cell.column)
      this.incrementCalculations()

      if (cell.possibleValues.length === 1) {
        // we just solved another cell. set it to solved and don't add to our detours array.
        cell.value = cell.possibleValues[0]
        cell.solved = true
        this.incrementCalculations()

        if (isInDetours) {
          // this cell was already in detours, but we just solved it. remove it.
          this.detours = this.detours.filter(d => d.id !== cell.id)
        }
        this.setDetoursForSolvedCell(cell)
      } else if (!isInDetours) {
        // this item isn't in our array yet. add it
        this.detours.push(cell)
      }
    }
  }

  getFlattenedGrid() {
    // returns a flattened array for enabling single-pass loop through all grid cells
    return this.grid.reduce((acc, row) => acc.concat(row), [])
  }

  makePass() {
    let hasUpdatedValues = false
    let hasReverted = false
    const cells = this.getFlattenedGrid()

    // pass through each cell and check for possible values
    // if it only has one possible, set it and mark it solved
    // otherwise, just update possible values and move on
    for (let cell of cells) {
      const row = cell.row
      const col = cell.column

      if (cell.solved === false) {
        if (cell.possibleValues.length === 0) {
          // we ran out of options here. We need to revert one more snapshot back before proceeding.
          this.revertSnapshot()
          this.incrementCalculations()
          hasReverted = true
          break
        }

        let possibleValues = this.getPossibleCellValues(row, col)
        this.incrementCalculations()

        if (possibleValues.length === 0) {
          // no possible values, this attempt is not correct. bail.
          this.revertSnapshot()
          this.incrementCalculations()
          hasReverted = true
          break
        }

        if (possibleValues.length < cell.possibleValues.length) {
          // this is a situation we can get ourselves in when reverting a snapshot.
          // if we have eliminated some possible values by trying them, we shouldn't
          // revert that knowledge. Only update cell.possibleValues if it benefits us.
          hasUpdatedValues = true
          cell.possibleValues = possibleValues
          this.incrementCalculations()
        }

        if (cell.possibleValues.length === 1) {
          cell.solved = true
          cell.value = cell.possibleValues[0]
          this.incrementCalculations()
          this.setDetoursForSolvedCell(cell)
        }
      }
    }

    // I tried running this immediately after solving a cell and also running it after a full pass through the board.
    // There were trade-offs both ways, but the time to solve didn't vary much, and this approach actually resulted
    // in fewer required calculations to solve the simpler puzzles than running immediately after solving a cell.
    while (this.detours.length > 0) {
      const { row, column } = this.detours.shift()
      const cell = this.grid[row][column]

      if (cell.solved === false) {
        let possibleValues = this.getPossibleCellValues(row, column)
        this.incrementCalculations()

        if (possibleValues.length === 0) {
          // no possible values, this attempt is not correct. bail.
          this.revertSnapshot()
          this.incrementCalculations()
          hasReverted = true
          this.detours = []
        }

        if (possibleValues.length < cell.possibleValues.length) {
          // this is a situation we can get ourselves in when reverting a snapshot.
          // if we have eliminated some possible values by trying them, we shouldn't
          // revert that knowledge. Only update cell.possibleValues if it benefits us.
          hasUpdatedValues = true
          cell.possibleValues = possibleValues
          this.incrementCalculations()
        }

        if (cell.possibleValues.length === 1) {
          cell.solved = true
          cell.value = cell.possibleValues[0]
          this.incrementCalculations()
          this.setDetoursForSolvedCell(cell)
        }
      }
    }

    if (hasUpdatedValues === false && hasReverted === false && !this.isSolved) {
      // we made it through without updating anything, start making assumptions.
      // find the most optimal unsolved cell to guess, try the first value, and take a snapshot.
      const cell = this.getOptimalGuessCell()
      // console.log(`optimal guess cell is ${cell.id} with values ${cell.possibleValues.join(', ')}`)
      this.incrementCalculations()

      // grab first item in possible values, and remove it from the array
      let testVal
      if (cell.possibleValues) {
        testVal = cell.possibleValues.shift()
      } else {
        // console.log('cell:', cell)
      }

      // take a snapshot NOW, so before we update the cell but after we've removed one possible value.
      // this will ensure we don't ever repeat checks but still test all cells properly.
      // also make sure we do a deep copy of the grid, so we don't retain object references
      const snapshot = klona(this.grid)
      this.addSnapshot(snapshot)
      this.incrementCalculations()

      // now update our value and solved
      cell.value = testVal
      cell.solved = true
      this.incrementCalculations()
    }
  }

  async solve() {
    if (!this.isSolved) {
      this.start()
    }

    while (!this.isSolved) {
      await sleep(this.makePass(), 0)
    }

    this.done()
  }
}
