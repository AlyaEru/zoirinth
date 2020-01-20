const util = require('./utilities')
const dirs = require('./directions')
const renderMap = require('./renderMap')
const constants = require('./gameConstants').constants

// Returns a new mine
function create(map, loc) {
	let mine = {
		actionQueue: [],
		type: 'mine',
		loc: loc
	}
	mine.actionQueue.push(addAction(map, mine))

	mine.getClass = () => {
		return 'mine'
	}

	mine.addAction = addAction(map, mine)
	mine.explode = () => {
		explode(map, mine)
	}

	return mine
}

// Returns a function that adds an action to the mine's actionQueue
function addAction(map, mine) {
	return () => {
		//if less than threshold, explode
		if (Math.random() < constants.mineExplodeProb) {
			mine.explode()
		} else {
			mine.actionQueue.push(addAction(map, mine))
		}
	}
}

function explode(map, mine) {
	renderMap.renderExplosion(mine.loc.x, mine.loc.y, 200)
	map.removeEntity('mines', mine.loc)
	let locs = [
		{x: mine.loc.x - 1, y: mine.loc.y},
		{x: mine.loc.x - 1, y: mine.loc.y - 1},
		{x: mine.loc.x - 1, y: mine.loc.y + 1},
		{x: mine.loc.x, y: mine.loc.y - 1},
		{x: mine.loc.x, y: mine.loc.y + 1},
		{x: mine.loc.x + 1, y: mine.loc.y},
		{x: mine.loc.x + 1, y: mine.loc.y - 1},
		{x: mine.loc.x + 1, y: mine.loc.y + 1}
	]
	for (let loc of locs) {
		map.explode(loc)
	}
}

module.exports = {
	create: create
}
