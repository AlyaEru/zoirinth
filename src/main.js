// Load jQuery globally
window.$ = window.jQuery = require('jquery')

// Start game
const gameplay = require('./gameplay')

const gameboardWidth = 30
const gameboardHeight = 18

gameplay.manageGame(gameboardWidth, gameboardHeight)
