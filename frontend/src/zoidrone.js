const util = require('./utilities')
const dirs = require('./directions')
const zoidSystem = require('./zoid')
const constants = require('./gameConstants').constants
const actionQueueSystem = require('./actionQueue')

// Returns a new zoid
function make(map) {
	let zoidrone = {
		actionQueue: actionQueueSystem.make(),
		mode: 'dormant',
		type: 'zoidrone'
	}
	zoidrone.actionQueue.push(addAction(map, zoidrone))

	zoidrone.getClass = () => {
		return zoidrone.mode === 'dormant' ? 'zoidrone' : 'pzoidrone'
	}

	zoidrone.addAction = addAction(map, zoidrone)

	map.entities.zoidrones.push(zoidrone)
	return zoidrone
}

function drop(map, loc) {
	zoidrone = make(map)
	zoidrone.loc = loc
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
					zoidSystem.drop(map, zoidrone.loc)
				}
				// if random value, wake up (create zoid at loc, delete myself from map?)
				break
		}
		zoidrone.actionQueue.push(addAction(map, zoidrone))
	}
}

module.exports = {
	drop
}
