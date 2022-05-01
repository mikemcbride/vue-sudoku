import Solver from '../lib/Solver.js'

export const solvePuzzle = async (data) => {
  const puzzle = new Solver(data)
  puzzle.solve()
  return puzzle
}