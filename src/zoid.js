const util = require('./utilities')
const dirs = require('./directions')
const playerSystem = require('./player')

const zoidModes = ['random', 'agressive']

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
	zoid.clovers = 0

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
			case 'agressive':
				let player = playerSystem.getPlayer()
				let shootDir = false
				if (zoid.loc.x === player.loc.x) {
					shootDir = zoid.loc.y > player.loc.y ? 'u' : 'd'
				} else if (zoid.loc.y === player.loc.y) {
					shootDir = zoid.loc.x > player.loc.x ? 'l' : 'r'
				}
				if (shootDir) {
					zoid.actionQueue.push(async function() {
						await map.shoot(zoid, shootDir)
					})
				} else {
					zoid.actionQueue.unshift(() =>
						map.moveEntity(zoid, util.randElem(dirs.dirs))
					)
				}
		}
		//change zoid mode?
		zoid.actionQueue.push(addAction(map, zoid))
	}
}

module.exports = {
	create: create
}
