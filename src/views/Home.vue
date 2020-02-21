<template>
  <div class="home">
    <section>
      <div>
        <h1>Sudoku Solver</h1>
        <Grid :grid="grid" @updated="setCell" />
      </div>
      <LoadingSpinner v-if="status === 'solving'" />
      <div v-else>
        <p>Calculations required: {{ puzzle.calculations }}</p>
        <p>Time to solve: {{ puzzle.solveTime }}</p>
        <button @click="solve">Solve</button>
        <button v-if="status !== 'solving'" @click="clear">Clear Puzzle</button>
        <ImportPuzzle @import="setPuzzle" />
      </div>
    </section>

    <aside>
      <h3>Prefill a puzzle:</h3>
      <button @click="loadPuzzle('easy')">Easy Puzzle</button>
      <button @click="loadPuzzle('medium')">Medium Puzzle</button>
      <button @click="loadPuzzle('hard')">Hard Puzzle</button>
      <button @click="loadPuzzle('evil')">Evil Puzzle</button>
      <section>
        Try one of <a href="http://www.aisudoku.com/index_en.html" target="_blank" rel="noreferrer noopener nofollow">Dr. Arto Inkala's</a> top 10 most difficult puzzles:

        <div class="insane">
          <button v-for="(p, i) in 10" :key="p" @click="loadInsanePuzzle(i)">{{ p }}</button>
        </div>
      </section>
    </aside>
  </div>
</template>

<script>
import defaultGrid from '@/lib/defaultGrid'
import puzzles from '@/lib/puzzles'
import parsePuzzle from '@/lib/parsePuzzle'
import Solver from '@/lib/Solver'
import Grid from '@/components/Grid'
import ImportPuzzle from '@/components/ImportPuzzle'
import LoadingSpinner from '@/components/LoadingSpinner'
import SolveWorker from '@/workers/solve.worker'

const sw = new SolveWorker()

export default {
  name: 'Home',
  components: {
    Grid,
    ImportPuzzle,
    LoadingSpinner
  },
  data() {
    return {
      puzzle: new Solver(defaultGrid),
      status: 'loaded'
    }
  },
  computed: {
    grid() {
      return this.puzzle.grid
    }
  },
  methods: {
    async solve() {
      this.status = 'solving'
      new Promise(resolve => sw.postMessage(this.grid))
    },
    loadPuzzle(level) {
      let puzzle = parsePuzzle(puzzles[level])
      this.puzzle = new Solver(puzzle)
    },
    loadInsanePuzzle(level) {
      let p = parsePuzzle(puzzles.insane[level])
      this.puzzle = new Solver(p)
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
  },
  mounted() {
    sw.onmessage = ({ data }) => {
      this.puzzle = data
      this.status = 'solved'
    }
  },
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

.insane {
  padding-top: 1rem;
  button {
    color: dodgerblue;
    display: inline-block;
    padding: 0 2px;
    margin: 0 2px;
    cursor: pointer;
    width: auto;
    background: #fff;
  }
}
</style>
