import Solver from '@/lib/Solver'

self.onmessage = ({ data }) => {
  const puzzle = new Solver(data)
  puzzle.solve()
  self.postMessage(puzzle)
}