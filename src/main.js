// Load jQuery globally
window.$ = window.jQuery = require('jquery')

// Start game
const gameplay = require('./gameplay')

const gameboardWidth = 18
const gameboardHeight = 12

renderMenu.renderWelcome()
gameplay.manageGame(gameboardWidth, gameboardHeight)
