import klona from 'klona'
import filterMutate from '@arr/filter.mutate'
import map from '@arr/map'
import some from '@arr/some'

// we will use these arrays to quickly map through all row and column indices
const range = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const allPossibleCellValues = map(range, it => it + 1)

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default class Solver {
  constructor(grid = []) {
    this.grid = grid
    this.calculations = 0
    this.snapshots = []
    this.startTime = 0
    this.finishTime = 0
    this.solveTime = '0s'
    this.detours = []
    this.methodInvocations = new Map()
    this.resetSolvedCells()
  }

  incrementMethodInvocations(methodName) {
    let val = 0
    if (this.methodInvocations.has(methodName)) {
      val = this.methodInvocations.get(methodName)
    }
    this.methodInvocations.set(methodName, val + 1)
  }

  logMethodInvocationCount() {
    let entries = []
    for (let entry of this.methodInvocations.entries()) {
      entries.push(entry)
    }
    console.log('method invocation count:')
    console.table(entries)
  }

  resetSolvedCells() {
    this.incrementMethodInvocations('resetSolvedCells')
    this.solvedCells = new Set()

    for (let row of this.grid) {
      for (let cell of row) {
        if (cell.solved === true) {
          this.solvedCells.add(cell.id)
        }
      }
    }
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
    this.solveTime = `${(this.finishTime - this.startTime) / 1000}s`
  }

  get isSolved() {
    return this.solvedCells.size === 81
  }

  getPossibleCellValues(row, col) {
    this.incrementMethodInvocations('getPossibleCellValues')
    let possibleVals = new Set(allPossibleCellValues)
    for (let cell of this.getRelatedSolvedCells(row, col)) {
      possibleVals.delete(cell.value)
    }
    return [...possibleVals]
  }

  markCellSolved(cell) {
    this.incrementMethodInvocations('markCellSolved')
    cell.solved = true
    this.solvedCells.add(cell.id)
    this.incrementCalculations()

    if (this.isInDetours(cell)) {
      // this cell was already in detours, but we just solved it. remove it.
      filterMutate(this.detours, d => d.id !== cell.id)
    }
    this.setDetoursForSolvedCell(cell)
  }

  getRelatedCells(row, col) {
    this.incrementMethodInvocations('getRelatedCells')
    return map(this.grid[row][col].relatedCells, id => {
      let [row, col] = id.split('.')
      return this.grid[row][col]
    })
  }

  getRelatedUnsolvedCells(row, col) {
    this.incrementMethodInvocations('getRelatedUnsolvedCells')
    let unsolved = []
    for (let cell of this.getRelatedCells(row, col)) {
      if (!this.solvedCells.has(cell.id)) {
        unsolved.push(cell)
      }
    }

    return unsolved
  }

  getRelatedSolvedCells(row, col) {
    this.incrementMethodInvocations('getRelatedSolvedCells')
    let solved = []
    for (let cell of this.getRelatedCells(row, col)) {
      if (this.solvedCells.has(cell.id)) {
        solved.push(cell)
      }
    }

    return solved
  }

  getAllUnsolvedCells() {
    this.incrementMethodInvocations('getAllUnsolvedCells')
    let unsolved = []
    for (let row of this.grid) {
      for (let cell of row) {
        if (!this.solvedCells.has(cell.id)) {
          unsolved.push(cell)
        }
      }
    }
    return unsolved
  }

  getOptimalGuessCell() {
    this.incrementMethodInvocations('getOptimalGuessCell')
    // we try to find the unsolved cell with the fewest possible values remaining
    let curPossibilities = Infinity
    let optimalCell
    let cells = this.getAllUnsolvedCells()
    for (let cell of cells) {
      if (cell.possibleValues.length < curPossibilities) {
        optimalCell = cell
        curPossibilities = cell.possibleValues.length
      }

      // we won't find a value lower than 2, eject early
      if (curPossibilities === 2) {
        return optimalCell
      }
    }

    return optimalCell
  }

  setCell({ val, row, col }) {
    this.incrementMethodInvocations('setCell')
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
    this.incrementMethodInvocations('addSnapshot')
    this.snapshots.push(grid)
  }

  revertSnapshot() {
    this.incrementMethodInvocations('revertSnapshot')
    this.grid = this.snapshots.pop() // take the latest snapshot
    this.resetSolvedCells()
  }

  incrementCalculations() {
    this.incrementMethodInvocations('incrementCalculations')
    this.calculations += 1
  }

  isInDetours(cell) {
    this.incrementMethodInvocations('isInDetours')
    return some(this.detours, (it => it.id === cell.id))
  }

  setDetoursForSolvedCell({ row, column }) {
    this.incrementMethodInvocations('setDetoursForSolvedCell')
    const unsolved = this.getRelatedUnsolvedCells(row, column)

    for (let cell of unsolved) {
      // we know the value of the solved cell, so update this cell's possible values to remove it.
      cell.possibleValues = this.getPossibleCellValues(cell.row, cell.column)
      this.incrementCalculations()

      if (cell.possibleValues.length === 1) {
        // we just solved another cell. set it to solved and don't add to our detours array.
        cell.value = cell.possibleValues[0]
        this.markCellSolved(cell)
      } else if (!this.isInDetours(cell)) {
        // this item isn't in our array yet. add it
        this.detours.push(cell)
      }
    }
  }

  makePass() {
    this.incrementMethodInvocations('makePass')
    let hasUpdatedValues = false
    let hasReverted = false
    const cells = this.getAllUnsolvedCells()

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
          cell.value = cell.possibleValues[0]
          this.markCellSolved(cell)
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
          cell.value = cell.possibleValues[0]
          this.markCellSolved(cell)
        }
      }
    }

    if (hasUpdatedValues === false && hasReverted === false && !this.isSolved) {
      // we made it through without updating anything, start making assumptions.
      // find the most optimal unsolved cell to guess, try the first value, and take a snapshot.
      const cell = this.getOptimalGuessCell()
      this.incrementCalculations()

      // grab first item in possible values, and remove it from the array
      let testVal
      if (cell.possibleValues !== undefined) {
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
      this.markCellSolved(cell)
    }
  }

  solve() {
    if (!this.isSolved) {
      this.start()
    }

    while (!this.isSolved) {
      this.makePass()
    }

    this.done()

    return this
  }
}
