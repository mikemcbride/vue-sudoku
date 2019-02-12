import Vue from 'vue'
import Vuex from 'vuex'
import defaultGrid from './defaultGrid'

// we will use these arrays to quickly map through all row and column indices
const range = [0,1,2,3,4,5,6,7,8]
const allPossibleCellValues = [1,2,3,4,5,6,7,8,9]

Vue.use(Vuex)

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const state = {
  // start off with a blank grid
  grid: defaultGrid,
  snapshots: [],
  calculations: 0
}

export const getters = {
  isSolved: state => {
    for (let row of state.grid) {
      const unsolvedCells = row.filter(cell => cell.solved !== true)
      if (unsolvedCells.length > 0) {
        // we have unsolved cells in this row
        return false
      }
    }
    // we made it to the end and all cells are solved
    return true
  },
  
  getPossibleCellValues: (state, getters) => (row, col) => {
    let cell = state.grid[row][col]
    // get an array of values for each cell in the current row, column, and square
    const rowVals = getters.getCellsInRow(row).filter(it => it.solved).map(it => it.value)
    const columnVals = getters.getCellsInColumn(col).filter(it => it.solved).map(it => it.value)
    const squareVals = getters.getCellsInSquare(row, col).filter(it => it.solved).map(it => it.value)
    
    // make a unique list of the above values
    const allVals = new Set([...rowVals, ...columnVals, ...squareVals])
    
    // return a filtered list that excludes the solved values from the set above
    return allPossibleCellValues.filter(it => allVals.has(it) === false)
  },
  getCellsInRow: (state) => (row) => {
    return range.map(col => state.grid[row][col])
  },
  getCellsInColumn: (state) => (col) => {
    return range.map(row => state.grid[row][col])
  },
  getCellsInSquare: (state) => (row, col) => {
    let cells = []
    // Math FTW! row - row %   3 will give us the starting index of the current box,
    // so we can get the rows of this box by adding 0, 1, and 2 to that value.
    let rows = [0,1,2].map(r => r + (row - row % 3))
    let cols = [0,1,2].map(c => c + (col - col % 3))
    
    rows.forEach(row => {
      cols.forEach(column => {
        cells.push(state.grid[row][column])
      })
    })
    
    return cells
  }
}

export const mutations = {
  SET_CELL(state, { row, col, cell }) {
    let grid = deepClone(state.grid)
    grid[row][col] = cell
    state.grid = grid
  },
  ADD_SNAPSHOT(state, grid) {
    state.snapshots = [...state.snapshots, grid]
  },
  REVERT_SNAPSHOT(state) {
    const snapshots = deepClone(state.snapshots)
    state.grid = snapshots.pop() // take the latest snapshot
    state.snapshots = snapshots // set the rest to snapshots
  },
  SET_GRID(state, grid) {
    state.grid = grid
  },
  SET_CALCULATIONS(state, val) {
    state.calculations = val
  },
  INCREMENT_CALCULATIONS(state) {
    state.calculations += 1
  }
}

export const actions = {
  loadPuzzle({ commit }, puzzle) {
    commit('SET_GRID', puzzle)
    commit('SET_CALCULATIONS', 0)
  },
  resetPuzzle({ commit }) {
    commit('SET_GRID', defaultGrid)
    commit('SET_CALCULATIONS', 0)
  },
  setCell({ commit }, {val, row, col}) {
    // this action only gets triggered when the user manually updates the value,
    // so we can assume that the cell is solved.
    const cell = {
      value: parseInt(val, 10),
      solved: true,
      possibleValues: []
    }
    
    if (isNaN(cell.value)) {
      cell.value = null
    }
    
    commit('SET_CELL', { row, col, cell })
  },
  
  solvePuzzle({ dispatch, getters }) {
    if (getters.isSolved === false) {
      dispatch('makePass')
    }
  },
  
  makePass({ getters, commit, dispatch, state }) {
    let hasUpdatedValues = false
    let hasReverted = false
    
    // pass through each cell and check for possible values
    // if it only has one possible, set it and mark it solved
    // otherwise, just update possible values and move on
    outer_loop: for (let row in state.grid) {
      let gridRow = state.grid[row]
      for (let col in gridRow) {
        let cell = Object.assign({}, state.grid[row][col])
        
        if (cell.solved === false) {
          if (cell.possibleValues.length === 0) {
            // we ran out of options here. We need to revert one more snapshot back before proceeding.
            commit('REVERT_SNAPSHOT')
            commit('INCREMENT_CALCULATIONS')
            hasReverted = true
            break outer_loop
          }
          
          let possibleValues = getters.getPossibleCellValues(row, col)
          commit('INCREMENT_CALCULATIONS')
          
          if (possibleValues.length === 0) {
            // no possible values, this attempt is not correct. bail.
            commit('REVERT_SNAPSHOT')
            commit('INCREMENT_CALCULATIONS')
            hasReverted = true
            break outer_loop
          }
          
          if (possibleValues.length < cell.possibleValues.length) {
            // this is a situation we can get ourselves in when reverting a snapshot.
            // if we have eliminated some possible values by trying them, we shouldn't
            // revert that knowledge. Only update cell.possibleValues if it benefits us.
            hasUpdatedValues = true
            cell.possibleValues = possibleValues
            commit('INCREMENT_CALCULATIONS')
          }
          
          if (cell.possibleValues.length === 1) {
            cell.solved = true
            cell.value = cell.possibleValues[0]
            commit('INCREMENT_CALCULATIONS')
          }
          
          // only commit the update if we actually changed something
          if (hasUpdatedValues) {
            commit('SET_CELL', { row, col, cell })
            commit('INCREMENT_CALCULATIONS')
          }
        }
      }
    }
    
    if (hasUpdatedValues === false && hasReverted === false) {
      // we made it through without updating anything.
      // take a snapshot and start making assumptions.
      let newGrid = deepClone(state.grid)
      
      // find the first unsolved cell, try the first possible value, and take a snapshot.
      outer_loop: for (let row in newGrid) {
        for (let col in newGrid[row]) {
          let cell = newGrid[row][col]
          
          commit('INCREMENT_CALCULATIONS')
          
          if (cell.solved === false) {
            // grab first item in possible values, and remove it from the array
            let testVal = cell.possibleValues.shift()
            
            // take a snapshot NOW, so before we update the cell but after we've removed one possible value.
            // this will ensure we don't ever repeat checks but still test all cells properly.
            // also make sure we do a deep copy of the grid, so we don't retain object references
            const snapshot = deepClone(newGrid)
            commit('ADD_SNAPSHOT', snapshot)
            commit('INCREMENT_CALCULATIONS')
            
            // now update our value and solved
            cell.value = testVal
            cell.solved = true
            
            // now update the grid
            commit('SET_GRID', newGrid)
            commit('INCREMENT_CALCULATIONS')
            
            break outer_loop
          }
        }
      }
    }
    
    if (getters.isSolved === false) {
      dispatch('makePass')
    }
  }
}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})