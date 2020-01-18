const util = require('./utilities')
const dirs = require('./directions')
const zoidSystem = require('./zoid')

const wakingProb = 0.001
const awakeProb = 0.01

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
				if (Math.random() < wakingProb) {
					zoidrone.mode = 'waking'
				}
				// if random value, switch to waking
				break
			case 'waking':
				console.log('waking')
				if (Math.random() < awakeProb) {
					console.log('tryna doit')
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
