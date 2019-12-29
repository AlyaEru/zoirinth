const gameplay = require('./gameplay')

const gameboardWidth = 30
const gameboardHeight = 18

$(function() {
	gameplay.manageGame(gameboardWidth, gameboardHeight)
})
