<template>
  <div id="app">
    <main>
      <router-view />
    </main>
    <footer>
      <a href="https://github.com/mikemcbride/vue-sudoku" target="_blank" rel="noreferrer noopener nofollow">GitHub</a>
    </footer>
  </div>
</template>

<style lang="scss">
html, body {
  box-sizing: border-box;
  margin: 0;
}

*, *:before, *:after {
  box-sizing: inherit;
}

#app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  padding: 2rem 1rem;
  flex: 1;
}

footer {
  border-top: 1px solid #ccc;
  padding: 2rem 1rem;
  text-align: center;
  
  a {
    color: #0074d9;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
