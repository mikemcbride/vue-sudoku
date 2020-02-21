import reduce from '@arr/reduce'
import map from '@arr/map'
const range = [0,1,2,3,4,5,6,7,8]

function isEmptyCellCharacter (char) {
  return char.toLowerCase() === 'x' || char === '.'
}

function getRelatedCellIds(row, col) {
  const related = new Set([
    ...getCellsInColumn(col),
    ...getCellsInRow(row),
    ...getCellsInSquare(row, col)
  ])

  related.delete(`${row}.${col}`)
  return [...related]
}

function getCellsInRow(row) {
  return map(range, col => `${row}.${col}`)
}

function getCellsInColumn(col) {
  return map(range, row => `${row}.${col}`)
}

function getCellsInSquare(row, col) {
  let cells = []
  // Math FTW! row - row % 3 will give us the starting index of the current box,
  // so we can get the rows of this box by adding 0, 1, and 2 to that value.
  const startRow = row - (row % 3)
  const startCol = col - (col % 3)
  let rows = map([0, 1, 2], r => r + startRow)
  let cols = map([0, 1, 2], c => c + startCol)

  for (let r of rows) {
    for (let c of cols) {
      cells.push(`${r}.${c}`)
    }
  }

  return cells
}

export default function (puzzle) {
  let puzzlePieces = puzzle.split('').filter(it => {
    // only allow x, period, or numbers 1-9
    if (isEmptyCellCharacter(it)) {
      return true
    }

    let num = parseInt(it, 10)

    if (isNaN(num)) {
      return false
    }

    return 0 < num < 10
  })

  if (puzzlePieces.length !== 81) {
    return {
      error: true,
      message: 'Import data must have 81 cells containing numbers or x for empty cells.'
    }
  } else {
    let grid = reduce(puzzlePieces, (acc, it, idx) => {
      let val
      if (isEmptyCellCharacter(it)) {
        val = {
          value: null,
          solved: false,
          possibleValues: [1,2,3,4,5,6,7,8,9]
        }
      } else {
        val = {
          value: parseInt(it, 10),
          solved: true,
          possibleValues: []
        }
      }

      let row = Math.floor(idx/9)
      val.row = row
      if (acc[row]) {
        val.column = acc[row].length
        val.id = `${val.row}.${val.column}`
        val.relatedCells = getRelatedCellIds(val.row, val.column)
        acc[row].push(val)
      } else {
        val.column = 0
        val.id = `${val.row}.${val.column}`
        val.relatedCells = getRelatedCellIds(val.row, val.column)
        acc[row] = [val]
      }

      return acc
    }, [])

    return grid
  }
}