const util = require('./utilities')
const dirs = require('./directions')

const explodeProb = 0.001

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

	return mine
}

// Returns a function that adds an action to the mine's actionQueue
function addAction(map, mine) {
	return () => {
		//if less than threshold, explode
		mine.actionQueue.push(addAction(map, mine))
	}
}

module.exports = {
	create: create
}
