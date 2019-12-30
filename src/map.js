const util = require('./utilities')
const dirs = require('./directions')
const buildMaze = require('./buildMaze')
const playerSystem = require('./player')
const zoidSystem = require('./zoid')

function createMap(width, height, level) {
	let map = {
		width: width,
		height: height,
		level: level,
		entities: [],
		clovers: level + 4,
		zoids: 1
	}

	map.maze = buildMaze.build(width, height)

	map.moveEntity = (entity, direction) => {
		moveEntity(map, entity, direction)
	}

	map.removeEntity = item => {
		removeEntity(map, item)
	}

	map.spawnEntity = entity => {
		spawnEntity(map, entity)
	}

	map.getPlayer = () => {
		return getPlayer(map.entities)
	}

	map.generateExit = () => {
		generateExit(map)
	}

	createEntities(map)
	console.log(map)

	return map
}

function createEntities(map) {
	playerSystem.createPlayer(map)
	createZoids(map, map.zoids)
	createClovers(map, map.clovers)
}

function createZoids(map, numZoids) {
	let zoids = []

	for (let i = 0; i < numZoids; i++) {
		zoids.push(zoidSystem.create(map))
	}
	return zoids
}

function createClovers(map, numClovers) {
	let clovers = []

	for (let i = 0; i < numClovers; i++) {
		clovers.push({
			loc: randSpawnPoint(map),
			getType: () => 'clover'
		})
	}

	map.entities.concat(clovers)
}

function generateExit(map) {
	let num = util.rand(map.width * 2 + map.height * 2)
	if (num < map.width) {
		map.maze[0][num * 2 + 1] = 'lr_portal'
	} else if (num < map.width * 2) {
		map.maze[map.height - 1][(num - map.width) * 2 + 1] = 'lr_portal'
	} else if (num < map.width * 2 + map.height) {
		map.maze[(num - 2 * map.width) * 2 + 1][0] = 'ud_portal'
	} else {
		map.maze[(num - 2 * map.width - map.height) * 2 + 1][map.width - 1] =
			'ud_portal'
	}
}

function moveEntity(map, entity, dir) {
	let runthrough = {
		clover: true,
		space: true,
		pod: true,
		superpod: true,
		lr_portal: true,
		ud_portal: true,
		player: true,
		player_shield: true
	}

	if (entity.runMode) {
		if (handleEntityMove(map, entity, locAt(entity.loc, dir))) {
			let forward = lookNext(entity, dir)
			let left = lookNext(entity, dirs.rotateLeft(dir))
			let right = lookNext(entity, dirs.rotateRight(dir))
			if (runthrough[forward] && !runthrough[left] && !runthrough[right]) {
				entity.actionQueue.unshift(() => {
					map.moveEntity(entity, dir)
				})
			}
		}
	} else {
		handleEntityMove(map, entity, locAt(entity.loc, dir))
	}
}

function handleEntityMove(map, entity, loc) {
	if (entity.getType() == 'player') {
		let player = entity // Renamed for clarity
		switch (itemAt(map, loc)) {
			case 'space':
				player.loc = loc
				return true
			case 'clover':
				removeEntity(map, loc)
				player.score += 100
				player.clovers++
				player.loc = loc
				return true
			case 'zoid':
				player.dead = true
				break
			case 'lr_portal':
			case 'ud_portal':
				player.escaped = true
				return true
				break
			//handle winning here?
		}
	} else if (entity.getType() == 'zoid') {
		let zoid = entity // Renamed for clarity
		switch (itemAt(map, loc)) {
			case ('space', 'clover'):
				zoid.loc = loc
				return true
			case 'player':
				player.dead = true
				return true
		}
	}

	return false
}

function lookNext(map, entity, dir) {
	return itemAt(map, dirs.locAt(entity.loc, dir))
}

function itemAt(map, loc) {
	if (loc.x < 0 || loc.x > map.width || loc.y < 0 || loc.y > map.height) {
		return 'outside'
	} else {
		return map[loc.y][loc.x]
	}
}

function spawnEntity(map, entity) {
	let spawnPoint = randSpawnPoint(map)
	entity.loc = spawnPoint
	map.entities.push(entity)
}

function randSpawnPoint(map) {
	let takenPoints = []
	while (true) {
		point = {
			x: util.randInt(map.width),
			y: util.randInt(map.height)
		}
		let match = false
		for (takenPoint of takenPoints) {
			if (takenPoint.x == point.x && takenPoint.y == point.y) {
				match = true
			}
		}
		if (match == false) {
			takenPoints.push(point)
			return point
		}
	}
}

function removeEntity(map, loc) {
	for (let i = 0; i < map.entities.length; i++) {
		if (map.entities[i].loc.x == loc.x && map.entities[i].loc.y == loc.y) {
			map.entities.splice(i, 1)
		}
	}
}

function getPlayer(entities) {
	return entities.filter(entity => {
		return entity.getType() == 'player'
	})
}

module.exports = {
	createMap: createMap
}
