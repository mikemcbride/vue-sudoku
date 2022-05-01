import map from '@arr/map'
const range = [0,1,2,3,4,5,6,7,8]

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

export default function (row, col) {
  const related = new Set([
    ...getCellsInColumn(col),
    ...getCellsInRow(row),
    ...getCellsInSquare(row, col)
  ])

  related.delete(`${row}.${col}`)
  return [...related]
}
