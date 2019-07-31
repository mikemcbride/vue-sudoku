# Sudoku Solver

A Vue app that can solve a sudoku puzzle using a slightly modified [BFS (brute force search) algorithm with backtracking](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking).

Brute force search algorithms take a relatively dumb approach. By that I mean they don't take into account any possible information to make smarter decisions - as the name implies, they simply brute force their way through the puzzle. They start at the first unsolved square, and test every single value to determine if it is possible. If it's possible to play in that square, it sets that value and then goes to the next square, backtracking when it cannot go any further. Eventually it will solve the puzzle, but it's the least efficient way to programmatically do this.

## The Approach

The approach in this project differs slightly from a normal brute force search in that we will work our way through each cell on the board and check how many possible values are safe to play in the current cell as we iterate, which is more like what a human does when it plays sudoku. When only one possible value remains for a cell, we set it. Each time we iterate through the cells, we re-calculate the possible cell values. We do this until we have made a pass through the entire board and not eliminated any possible values. At this point, we take a snapshot of the current board (so we can backtrack) and we move through the cells until we find the first cell without a set value. We then look at its list of possible values, start with the first possible value, and continue solving the puzzle assuming that is the right value. We do this until we complete the puzzle or are unable to solve any more cells. Once we can no longer solve cells, we backtrack our checkpoint and choose the next possible value in the first unsolved cell, and repeat this process until all cells are solved. The key distinction here is that rather than blindly setting each value, we only set the values of a cell when we have eliminated all other possible values, or are unable to proceed without guessing. In theory this should be faster than a normal BFS.

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

## Puzzle Data for Development

There are four puzzles that can be pre-loaded. This is mostly for easier testing during development, but also useful to show the app working.

## Import a Puzzle

You can import a puzzle using a textarea located beneath the puzzle grid. For empty squares, put an `x`. No need for spaces, commas, or line-breaks (but I'll handle those if you put them in).

## Contributing

If you have enhancements or suggestions I'd love to hear them. Open an issue or cut a PR!

## License

MIT
