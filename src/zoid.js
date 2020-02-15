const util = require('./utilities')
const dirs = require('./directions')
const playerSystem = require('./player')
const actionQueueSystem = require('./actionQueue')

const zoidModes = ['random', 'agressive']

// Returns a new zoid
function randSpawn(map) {
	let zoid = make(map)
	map.spawnEntity(zoid)
	return zoid
}

function drop(map, loc) {
	let zoid = make(map)
	zoid.loc = loc
	return zoid
}

function make(map) {
	let zoid = {
		actionQueue: actionQueueSystem.make(),
		runMode: true,
		mode: '',
		runthrough: {
			clover: true,
			space: true,
			pod: true,
			superpod: true,
			player: true
		}
	}
	zoid.actionQueue.push(addAction(map, zoid))

	zoid.type = 'zoid'
	zoid.mode = 'random' //util.randElem(zoidModes)
	zoid.clovers = 0

	zoid.getClass = () => {
		return 'zoid'
	}

	zoid.addAction = addAction(map, zoid)
	map.entities.zoids.push(zoid)
	return zoid
}

// Returns a function that adds an action to the zoid's actionQueue
function addAction(map, zoid) {
	return () => {
		switch (zoid.mode) {
			case 'random':
				let randDirs = util.shuffle(dirs.dirs)
				let dir = false
				for (let i = 0; i < randDirs.length; i++) {
					if (zoid.runthrough[map.lookNext(zoid, randDirs[i])]) {
						dir = randDirs[i]
						break
					}
				}
				if (!dir) {
					zoid.mode = 'stuck'
				} else {
					zoid.actionQueue.unshift(() => {
						map.moveEntity(zoid, dir)
					})
				}
				break
			case 'stuck':
				zoid.actionQueue.push(async function() {
					await map.shoot(zoid, util.randElem(dirs.dirs))
				})
				zoid.mode = 'random'
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
					zoid.actionQueue.unshift(() => {
						map.moveEntity(zoid, util.randElem(dirs.dirs))
					})
				}
		}
		//change zoid mode?
		zoid.actionQueue.push(addAction(map, zoid))
	}
}

module.exports = {
	drop,
	randSpawn
}
