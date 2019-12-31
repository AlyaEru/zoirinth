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
		actors: [],
		clovers: level + 4,
		zoids: 1
	}

	map.maze = buildMaze.build(width, height)

	map.simulate = () => {
		return simulate(map)
	}

	map.moveEntity = (entity, direction) => {
		moveEntity(map, entity, direction)
	}

	map.removeClover = item => {
		removeClover(map, item)
	}

	map.generateExit = () => {
		generateExit(map)
	}

	map.spawnEntity = entity => {
		spawnEntity(map, entity)
	}

	createEntitiesAndActors(map)

	return map
}

function createEntitiesAndActors(map) {
	let player = playerSystem.createPlayer(map)
	map.entities.players = [player]
	map.actors.push(player)

	createZoids(map, map.zoids)
	createClovers(map, map.clovers)
}

function createZoids(map, numZoids) {
	let zoids = []

	for (let i = 0; i < numZoids; i++) {
		zoids.push(zoidSystem.create(map))
	}
	map.entities.zoids = zoids
	map.actors.push(zoids)
	return zoids
}

function createClovers(map, numClovers) {
	let clovers = []

	for (let i = 0; i < numClovers; i++) {
		clovers.push({
			loc: randSpawnPoint(map),
			getType: () => 'clover',
			type: 'clover'
		})
	}

	map.entities.clovers = clovers
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

function simulate(map) {
	mapCopy = JSON.parse(JSON.stringify(map.maze)) //deep clone map
	for (let entity of Object.values(map.entities)) {
		for (let i = 0; i < entity.length; i++) {
			mapCopy[entity[i].loc.y][entity[i].loc.x] = entity[i].type
		}
	}
	return mapCopy
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
		if (handleEntityMove(map, entity, dirs.locAt(entity.loc, dir))) {
			let forward = lookNext(map, entity, dir)
			let left = lookNext(map, entity, dirs.rotateLeft(dir))
			let right = lookNext(map, entity, dirs.rotateRight(dir))
			if (runthrough[forward] && !runthrough[left] && !runthrough[right]) {
				entity.actionQueue.unshift(() => {
					map.moveEntity(entity, dir)
				})
			}
		}
	} else {
		handleEntityMove(map, entity, dirs.locAt(entity.loc, dir))
	}
}

function handleEntityMove(map, entity, loc) {
	if (entity.type === 'player') {
		let player = entity // Renamed for clarity
		switch (itemAt(map, loc)) {
			case 'space':
				player.loc = loc
				return true
			case 'clover':
				removeClover(map, loc)
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
	} else if (entity.type === 'zoid') {
		let zoid = entity // Renamed for clarity
		switch (itemAt(map, loc)) {
			case 'space':
				zoid.loc = loc
				return true
			case 'clover':
				zoid.clovers++
				removeClover(map, loc)
				zoid.loc = loc
				return true
			case 'player':
				player.dead = true
				return true
		}
	}

	return false
}

function spawnEntity(map, entity) {
	let spawnPoint = randSpawnPoint(map)
	entity.loc = spawnPoint
}

function lookNext(map, entity, dir) {
	return itemAt(map, dirs.locAt(entity.loc, dir))
}

function itemAt(map, loc) {
	if (
		loc.x < 0 ||
		loc.x > map.width * 2 + 1 ||
		loc.y < 0 ||
		loc.y > map.height * 2 + 1
	) {
		return 'outside'
	} else {
		return map.simulate()[loc.y][loc.x]
	}
}

function randSpawnPoint(map) {
	let takenPoints = []
	while (true) {
		point = {
			x: util.randInt(map.width) * 2 + 1,
			y: util.randInt(map.height) * 2 + 1
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

/*function removeEntity(map, loc) {
	for (let i = 0; i < Object.values(map.entities).length; i++) {
		if (map.entities[i].loc.x == loc.x && map.entities[i].loc.y == loc.y) {
			map.entities.splice(i, 1)
		}
	}
}*/

function removeClover(map, loc) {
	for (let i = 0; i < map.entities.clovers.length; i++) {
		if (
			map.entities.clovers[i].loc.x == loc.x &&
			map.entities.clovers[i].loc.y == loc.y
		) {
			map.entities.clovers.splice(i, 1)
		}
	}
}

function getPlayer(entities) {
	return entities.filter(entity => {
		return entity.getType() == 'player'
	})
}

module.exports = {
	createMap: createMap,
	simulate: simulate
}
