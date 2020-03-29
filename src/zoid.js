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

function randMode() {
	const rand = Math.random()
	if (rand < 0.4) {
		return 'random'
	} else if (rand < 0.8) {
		return 'explorer'
	} else if (rand < 0.9) {
		return 'agressive'
	} else {
		return 'chase'
	}
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
	zoid.mode = 'explorer' //util.randElem(zoidModes)
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
				if (Math.random() < 0.1) {
					zoid.mode = randMode()
				}
				break
			case 'stuck':
				zoid.actionQueue.push(async function() {
					await map.shoot(zoid, util.randElem(dirs.dirs))
				})
				zoid.mode = randMode()
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
				if (Math.random() < 0.3) {
					zoid.mode = randMode()
				}
				break
			case 'explorer': {
				let randDirs = util.shuffle(dirs.dirs)
				let dir = false
				let newDir = false
				for (let i = 0; i < randDirs.length; i++) {
					let item = map.lookNext(zoid, randDirs[i])
					if (zoid.runthrough[item]) {
						dir = randDirs[i]
						if (item === 'space') {
							newDir = randDirs[i]
						}
					}
				}
				if (newDir) {
					console.log(newDir)
					dir = newDir
				}
				if (!dir) {
					zoid.mode = 'stuck'
				} else {
					zoid.actionQueue.unshift(() => {
						map.moveEntity(zoid, dir)
					})
				}
				if (Math.random() < 0.1) {
					zoid.mode = randMode()
				}
				break
			}
			case 'chase':
				let loc = {x: zoid.loc.x, y: zoid.loc.y}

				let shortestSteps = Infinity
				let bestDir = util.randElem(dirs.dirs)
				for (let dir of dirs.dirs) {
					let steps = DFS(dirs.locAt(loc, dir), dir, 10)
					//console.log(steps, dir)
					if (steps < shortestSteps) {
						shortestSteps = steps
						bestDir = dir
					}
				}

				//retask if it can't see the player
				if (shortestSteps === Infinity) {
					zoid.mode = 'random'
				} else if (Math.random() < 0.1) {
					zoid.mode = randMode()
				}
				zoid.actionQueue.push(() => {
					zoid.runMode = false
					map.moveEntity(zoid, bestDir)
					zoid.runMode = true
				})

				function DFS(loc, prevDir, depth) {
					if (map.itemAt(loc) === 'player') {
						return 0
					}
					if (!zoid.runthrough[map.itemAt(loc)]) {
						return Infinity
					}
					if (depth === 0) {
						return Infinity
					}

					let shortestSteps = Infinity
					for (let dir of dirs.dirs.filter(
						item => item != dirs.opposite(prevDir)
					)) {
						//TODO: no backwards
						let steps = DFS(dirs.locAt(loc, dir), dir, depth - 1)
						if (steps < shortestSteps) {
							shortestSteps = steps
						}
					}
					return shortestSteps + 1
				}

				break
		}
		//change zoid mode?
		zoid.actionQueue.push(addAction(map, zoid))
	}
}

module.exports = {
	drop,
	randSpawn
}
