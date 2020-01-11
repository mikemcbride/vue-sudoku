import klona from 'klona'

// we will use these arrays to quickly map through all row and column indices
const range = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const allPossibleCellValues = range.map(it => it + 1)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default class Solver {
  constructor(grid = []) {
    this.grid = klona(grid)
    this.calculations = 0
    this.snapshots = []
    this.startTime = 0
    this.finishTime = 0
  }

  start() {
    this.startTime = Date.now()
  }

  done() {
    this.snapshots = []
    this.finishTime = Date.now()
  }

  get solveTime() {
    if (!this.isSolved) {
      return `0s`
    }

    return `${(this.finishTime - this.startTime) / 1000}s`
  }

  get isSolved() {
    for (let row of this.grid) {
      const unsolvedCells = row.filter(cell => cell.solved !== true)
      if (unsolvedCells.length > 0) {
        // we have unsolved cells in this row
        return false
      }
    }
    // we made it to the end and all cells are solved
    return true
  }

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
    let rows = [0, 1, 2].map(r => r + (row - (row % 3)))
    let cols = [0, 1, 2].map(c => c + (col - (col % 3)))

    rows.forEach(row => {
      cols.forEach(column => {
        cells.push(this.grid[row][column])
      })
    })

    return cells
  }

  setCell({ val, row, col }) {
    // this only gets triggered when the user manually updates the value,
    // so we can assume that the cell is solved.
    const cell = {
      value: val,
      solved: val === null ? false : true,
      possibleValues: val === null ? [...allPossibleCellValues] : []
    }
    this.grid[row][col] = cell
  }

  setCellValue({ row, col, val }) {
    this.grid[row][col].value = val
  }

  setCellSolved({ row, col, val }) {
    this.grid[row][col].solved = val
  }

  addSnapshot(grid) {
    this.snapshots = [...this.snapshots, grid]
  }

  revertSnapshot() {
    const snapshots = klona(this.snapshots)
    this.grid = snapshots.pop() // take the latest snapshot
    this.snapshots = snapshots // set the rest to snapshots
  }

  incrementCalculations() {
    this.calculations += 1
  }

  makePass() {
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
            this.revertSnapshot()
            this.incrementCalculations()
            hasReverted = true
            break outer_loop
          }

          let possibleValues = this.getPossibleCellValues(row, col)
          this.incrementCalculations()

          if (possibleValues.length === 0) {
            // no possible values, this attempt is not correct. bail.
            this.revertSnapshot()
            this.incrementCalculations()
            hasReverted = true
            break outer_loop
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

          this.incrementCalculations()

          if (cell.solved === false) {
            // grab first item in possible values, and remove it from the array
            let testVal = cell.possibleValues.shift()

            // take a snapshot NOW, so before we update the cell but after we've removed one possible value.
            // this will ensure we don't ever repeat checks but still test all cells properly.
            // also make sure we do a deep copy of the grid, so we don't retain object references
            const snapshot = klona(this.grid)
            this.addSnapshot(snapshot)
            this.incrementCalculations()

            // now update our value and solved
            this.setCellValue({ row, col, val: testVal })
            this.setCellSolved({ row, col, val: true })
            this.incrementCalculations()

            break outer_loop
          }
        }
      }
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