<template>
  <div class="home">
    <section>
      <div>
        <h1>Sudoku Solver</h1>
        <Grid :grid="grid" @updated="setCell" />
      </div>
      <p>Calculations required: {{ puzzle.calculations }}</p>
      <p>Time to solve: {{ puzzle.solveTime }}</p>
      <button @click="solve">Solve</button>
      <button @click="clear">Clear Puzzle</button>
      <ImportPuzzle @import="setPuzzle" />
    </section>

    <aside>
      <h3>Prefill a puzzle:</h3>
      <button @click="loadPuzzle('easy')">Easy Puzzle</button>
      <button @click="loadPuzzle('medium')">Medium Puzzle</button>
      <button @click="loadPuzzle('hard')">Hard Puzzle</button>
      <button @click="loadPuzzle('evil')">Evil Puzzle</button>
      <button @click="loadPuzzle('hardest')">World's Hardest Sudoku</button>
      <a href="https://www.conceptispuzzles.com/index.aspx?uri=info/article/424" target="_blank">Worlds Hardest Sudoku according to this article</a>
    </aside>
  </div>
</template>

<script>
import defaultGrid from '@/lib/defaultGrid'
import klona from 'klona'
import puzzles from '@/lib/puzzles'
import Solver from '@/lib/Solver'
import Grid from '@/components/Grid'
import ImportPuzzle from '@/components/ImportPuzzle'

export default {
  name: 'Home',
  components: {
    Grid,
    ImportPuzzle
  },
  data() {
    return {
      puzzle: new Solver(defaultGrid)
    }
  },
  computed: {
    grid() {
      return this.puzzle.grid
    }
  },
  methods: {
    solve() {
      this.puzzle.solve()
    },
    loadPuzzle(level) {
      let puzzle = klona(puzzles[level])
      this.puzzle = new Solver(puzzle)
    },
    setPuzzle(puzzle) {
      this.puzzle = new Solver(puzzle)
    },
    clear() {
      this.puzzle = new Solver(defaultGrid)
    },
    setCell(payload) {
      this.puzzle.setCell(payload)
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
