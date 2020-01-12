function isEmptyCellCharacter (char) {
  return char.toLowerCase() === 'x' || char === '.'
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
    let grid = puzzlePieces
      .map(it => {
        if (isEmptyCellCharacter(it)) {
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
          val.id = `${val.row}.${val.column}`
          acc[row].push(val)
        } else {
          val.column = 0
          val.id = `${val.row}.${val.column}`
          acc[row] = [val]
        }

        return acc
      }, [])

    return grid
  }
}