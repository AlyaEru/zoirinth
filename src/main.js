const constants = require('./gameConstants').constants

// Load jQuery globally
window.$ = window.jQuery = require('jquery')

// Start game
const gameplay = require('./gameplay')

gameplay.manageGame(constants.gameboardWidth, constants.gameboardHeight)
