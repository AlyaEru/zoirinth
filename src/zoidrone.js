const util = require('./utilities')
const dirs = require('./directions')
const zoidSystem = require('./zoid')
const constants = require('./gameConstants').constants

// Returns a new zoid
function create(map, loc) {
	let zoidrone = {
		actionQueue: [],
		mode: 'dormant',
		type: 'zoidrone',
		loc: loc
	}
	zoidrone.actionQueue.push(addAction(map, zoidrone))

	zoidrone.getClass = () => {
		return zoidrone.mode === 'dormant' ? 'zoidrone' : 'pzoidrone'
	}

	zoidrone.addAction = addAction(map, zoidrone)

	return zoidrone
}

// Returns a function that adds an action to the zoid's actionQueue
function addAction(map, zoidrone) {
	return () => {
		switch (zoidrone.mode) {
			case 'dormant':
				if (Math.random() < constants.zoidroneWakingProb) {
					zoidrone.mode = 'waking'
				}
				// if random value, switch to waking
				break
			case 'waking':
				if (Math.random() < constants.zoidroneTransformProb) {
					map.removeEntity('zoidrones', zoidrone.loc)
					zoidSystem.born(map, zoidrone.loc)
				}
				// if random value, wake up (create zoid at loc, delete myself from map?)
				break
		}
		zoidrone.actionQueue.push(addAction(map, zoidrone))
	}
}

module.exports = {
	create: create
}
