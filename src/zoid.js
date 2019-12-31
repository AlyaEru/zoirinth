const util = require('./utilities')
const dirs = require('./directions')

const zoidModes = ['random']

// Returns a new zoid
function create(map) {
	let zoid = {
		actionQueue: [],
		runMode: true,
		mode: '',
		dir: ''
	}
	zoid.actionQueue.push(addAction(map, zoid))

	zoid.type = 'zoid'
	zoid.mode = util.randElem(zoidModes)

	zoid.getType = () => {
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

/*function zoidAction(zoid) {
	let dirs = ['l','r','u','d']
	
	return () => {
		zoid.runMode = true
		if (zoid.mode === '') {
			zoid.mode = zoidModes[rand(zoidModes.length)]
		}
		if (zoid.mode === 'random') {
			
			zoid.actionQueue.unshift(() => go(zoid, dirs[rand(dirs.length)]))
			}
		zoid.actionQueue.push(zoidAction(zoid))
	}
}*/

module.exports = {
	create: create
}
