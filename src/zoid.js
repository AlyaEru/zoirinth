const util = require('./utilities')
const dirs = require('./directions')

const zoidModes = ['random']

// Returns a new zoid
function create(map) {
	let zoid = {
		actionQueue: [],
		runMode: true,
		mode: ''
	}
	zoid.actionQueue.push(addAction(map, zoid))

	zoid.type = 'zoid'
	zoid.mode = util.randElem(zoidModes)

	zoid.getClass = () => {
		return 'zoid'
	}

	zoid.addAction = addAction(map, zoid)

	map.spawnEntity(zoid)

	return zoid
}

// Returns a function that adds an action to the zoid's actionQueue
function addAction(map, zoid) {
	return () => {
		switch (zoid.mode) {
			case 'random':
				zoid.actionQueue.unshift(() =>
					map.moveEntity(zoid, util.randElem(dirs.dirs))
				)
				break
		}
		zoid.actionQueue.push(addAction(map, zoid))
	}
}

module.exports = {
	create: create
}
