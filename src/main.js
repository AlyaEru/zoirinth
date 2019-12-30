// Load jQuery globally
window.$ = window.jQuery = require('jquery')

// Start game
const gameplay = require('./gameplay')

const gameboardWidth = 24
const gameboardHeight = 15

gameplay.manageGame(gameboardWidth, gameboardHeight)
