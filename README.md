# Sudoku Solver

A Vue app that can solve a sudoku puzzle using a slightly modified [BFS (brute force search) algorithm with backtracking](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking).

Brute force search algorithms take a relatively dumb approach. By that I mean they don't take into account any possible information to make smarter decisions - as the name implies, they simply brute force their way through the puzzle. They start at the first unsolved square, and test every single value to determine if it is possible. If it's possible to play in that square, it sets that value and then goes to the next square, backtracking when it cannot go any further. Eventually it will solve the puzzle, but it's the least efficient way to programmatically do this.

## The Approach

The approach in this project differs slightly from a normal brute force search in that we will work our way through each cell on the board and check how many possible values are safe to play in the current cell as we iterate, which is more like what a human does when it plays sudoku. When only one possible value remains for a cell, we set it. When we solve a cell, we then make what I call a "detour" and check any cells in the same row, column, or square and eliminate the newly solved value from their possible values. If eliminating a value during this detour solves one of these cells, we take another detour off of that. Again, this part of the algorithm mimics the way humans attempt to solve these puzzles.

Each time we iterate through the cells, we re-calculate the possible cell values. We do this until we have made a pass through the entire board and not eliminated any possible values. At this point, we take a snapshot of the current board (so we can backtrack) and we move through the cells until we find the first cell without a set value. We then look at its list of possible values, start with the first possible value, and continue solving the puzzle assuming that this is the right value. We do this until we complete the puzzle or are unable to solve any more cells. Once we can no longer solve cells, we backtrack to our checkpoint and choose the next possible value in the first unsolved cell, and repeat this process until all cells are solved. The key distinction here is that rather than guessing each value immediately, we set the value of a cell when we have eliminated all other possible values using our logic before we proceed to guessing. In theory this should be significantly faster than a normal BFS.

## Data Structure

The sudoku grid is stored in a two-dimensional array like the one illustrated below:

```js
const grid = [
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}],
  [{}, {}, {}, {}, {}, {}, {}, {}, {}]
]
```

Cells are accessed by their row and then column index respectively. So `grid[0][0]` gives you the value of the top left box.

Each cell in the grid is an object containing some information about the cell:

- the value, if we are able to determine it
- possible remaining values (an array of integers)
- a flag on whether or not it is solved
- the column and row where it resides

Some example cell values:

```js
{
  value: null,
  possibleValues: [1,2,3,4,5],
  solved: false,
  column: 1,
  row: 5
},
{
  value: 2,
  possibleValues: [2],
  solved: true,
  column: 6,
  row: 3
}
```

Inside our `Solver` class, we keep track of a few other things in addition to this `grid` structure:

- The number of calculations (an integer)
- The `snapshots`, for backtracking (an Array)
- The `detours` (an Array)
- The start time and finish time (instances of `Date.now()`), which we use to display total time to solve the puzzle

## Puzzle Data for Development

There are four puzzles that can be pre-loaded. This is mostly for easier testing during development, but also useful to show the app working.

## Import a Puzzle

You can import a puzzle using a textarea located beneath the puzzle grid. This app supports two formats for loading puzzles: Sudoku Puzzle format and Simple Sudoku format. See [this page](http://www.sudocue.net/fileformats.php) for more info on Sudoku file formats.

### Example Sudoku Puzzle file

```
2..1.5..3
.54...71.
.1.2.3.8.
6.28.73.4
.........
1.53.98.6
.2.7.1.6.
.81...24.
7..4.2..1
```

### Example Simple Sudoku file

```
1..|...|7..
.2.|...|5..
6..|38.|...
-----------
.78|...|...
...|6.9|...
...|...|14.
-----------
...|.25|..9
..3|...|.6.
..4|...|..2
```

There is also an older format of Simple Sudoku files, which this app can also parse (you can use uppercase or lowercase `x`):

```
X6X1X4X5X
XX83X56XX
2XXXXXXX1
8XX4X7XX6
XX6XXX3XX
7XX9X1XX4
5XXXXXXX2
XX72X69XX
X4X5X8X7X
```

## Contributing

If you have enhancements or suggestions I'd love to hear them. Open an issue or cut a PR!

## License

MIT
