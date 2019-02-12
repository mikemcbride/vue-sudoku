<template>
  <div class="home">
    <section>
      <div>
        <Grid />
      </div>
      <p>Calculations required: {{ calculations }}</p>
      <button @click="solve">Solve</button>
      <button @click="clear">Clear Puzzle</button>
    </section>
    
    <p>You can paste in a valid Vuex state object below (see the README) and seed some sample data.</p>
    <div>
      <textarea v-model="seedData" rows="10"></textarea>
    </div>
    <button @click="loadPuzzle">Load Puzzle</button>
  </div>
</template>

<script>
import Grid from '@/components/Grid'
import { mapState } from 'vuex'

export default {
  name: 'home',
  components: {
    Grid,
  },
  computed: {
    ...mapState(['calculations'])
  },
  data() {
    return {
      seedData: null
    }
  },
  methods: {
    solve() {
      this.$store.dispatch('solvePuzzle')
    },
    loadPuzzle() {
      let data = JSON.parse(this.seedData)
      this.$store.dispatch('loadPuzzle', data.grid)
      this.seedData = null
    },
    clear() {
      this.$store.dispatch('resetPuzzle')
    }
  },
}
</script>

<style lang="scss" scoped>
.home {
  text-align: center;
  > div {
    margin-bottom: 2rem;
  }
}

textarea {
  background: #f5f6f7;
  border: 1px solid #ccc;
  border-radius: 0;
  font-family: monospace;
  font-size: 14px;
  max-width: 400px;
  resize: vertical;
  padding: .5rem;
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

section {
  margin-bottom: 4rem;
}
</style>
