const util = require('./utilities')
const dirs = require('./directions')
const buildMaze = require('./buildMaze')
const playerSystem = require('./player')
const zoidSystem = require('./zoid')
const zoidroneSystem = require('./zoidrone')
const cloverSystem = require('./clover')
const mineSystem = require('./mine')
const renderMap = require('./renderMap')
const constants = require('./gameConstants').constants

let takenPoints = []

function isShootableWall(map, loc) {
	type = itemAt(map, loc)
	return type.substring(type.length - 5) === '_weak' && !isEdgeWall(map, loc)
}

function isEdgeWall(map, loc) {
	return (
		loc.y === 0 ||
		loc.y === map.maze.length - 1 ||
		loc.x === 0 ||
		loc.x === map.maze[0].length - 1
	)
}

function createMap(width, height, gameStats) {
	let level = gameStats.level
	let map = {
		width: width,
		height: height,
		gameStats,
		gameStats,
		entities: {
			zaps: [],
			zoids: [],
			zoidrones: [],
			mines: [],
			clovers: []
		},
		clovers: level + 4,
		zoids: level + 2
	}

	map.maze = buildMaze.build(width, height, 1 - ((level - 1) % 5) / 4)

	takenPoints = []

	map.simulate = () => {
		return simulate(map)
	}

	map.simulateReal = () => {
		return simulateReal(map)
	}

	map.moveEntity = (entity, direction) => {
		moveEntity(map, entity, direction)
	}

	map.removeEntity = (entityType, loc) => {
		removeEntity(map, entityType, loc)
	}

	map.shoot = async function(entity, dir) {
		await shoot(map, entity, dir)
	}

	map.generateExit = () => {
		generateExit(map)
	}

	map.spawnEntity = entity => {
		spawnEntity(map, entity)
	}

	map.lookNext = (entity, dir) => {
		return lookNext(map, entity, dir)
	}

	map.explode = loc => {
		explode(map, loc)
	}

	createEntitiesAndActors(map)

	return map
}

function createEntitiesAndActors(map) {
	let player = playerSystem.createPlayer(map)
	map.entities.players = [player]

	for (let i = 0; i < map.zoids; i++) {
		zoidSystem.randSpawn(map)
	}
	for (let i = 0; i < map.clovers; i++) {
		cloverSystem.randSpawn(map)
	}
}

function generateExit(map) {
	let num = util.randInt(map.width * 2 + map.height * 2)
	if (num < map.width) {
		map.maze[0][num * 2 + 1] = 'lr_portal'
	} else if (num < map.width * 2) {
		map.maze[map.height * 2][(num - map.width) * 2 + 1] = 'lr_portal'
	} else if (num < map.width * 2 + map.height) {
		map.maze[(num - 2 * map.width) * 2 + 1][0] = 'ud_portal'
	} else {
		map.maze[(num - 2 * map.width - map.height) * 2 + 1][map.width * 2] =
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

function simulateReal(map) {
	mapCopy = JSON.parse(JSON.stringify(map.maze)) //deep clone map
	for (let entity of Object.values(map.entities)) {
		for (let i = 0; i < entity.length; i++) {
			mapCopy[entity[i].loc.y][entity[i].loc.x] = entity[i].getClass()
		}
	}
	return mapCopy
}

async function shoot(map, entity, dir) {
	let shootDelay = 50
	let zap = {
		loc: {x: entity.loc.x, y: entity.loc.y},
		getClass: () => 'bullet_' + dir,
		type: 'bullet',
		dir: dir,
		hello: 'world'
	}
	let zaps = new Array(zap)
	map.entities.zaps = zaps
	while (true) {
		let nextSpot = dirs.locAt(zap.loc, dir)
		let keepMoving = handleEntityMove(map, zap, nextSpot)
		if (!keepMoving) {
			renderMap.renderBulletExplosion(nextSpot.x, nextSpot.y, 200)
			removeEntity(map, 'zaps', zap.loc)
		}
		renderMap.render(simulateReal(map))
		if (!keepMoving) {
			break
		}
		await util.wait(shootDelay)
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
		zoidrone: true
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

function zoidDrop(map, loc) {
	//is this affected by the level, number of points?
	//is affected by zoid's number of clovers
	let zoid = map.entities.zoids.filter(
		zoid => zoid.loc.x === loc.x && zoid.loc.y === loc.y
	)[0]

	let randNum = Math.random()
	let addedTo = 0
	let keepTotal = adding => {
		addedTo += adding
		return addedTo
	}

	if (randNum < keepTotal(constants.layZoidroneProb)) {
		zoidroneSystem.drop(map, loc)
	} else if (randNum < keepTotal(constants.layMineProb)) {
		mineSystem.drop(map, loc)
	} else if (randNum < keepTotal(constants.layCloverProb * zoid.clovers)) {
		cloverSystem.drop(map, loc)
		zoid.clovers--
	} else {
		map.maze[loc.y][loc.x] = 'pod'
	}
	//other options: mine, superpod, clover, zoidrone
}

function handleEntityMove(map, entity, loc) {
	if (entity.type === 'player') {
		let player = entity // Renamed for clarity
		switch (itemAt(map, loc)) {
			case 'space':
				player.loc = loc
				return true
			case 'pod':
				player.score += 1
				map.maze[loc.y][loc.x] = 'space'
				player.loc = loc
				return true
			case 'clover':
				removeEntity(map, 'clovers', loc)
				player.score += 100
				player.clovers++
				player.loc = loc
				return true
			case 'zoid':
				playerSystem.getPlayer().dead = true
				break
			case 'zoidrone':
				let zoidrone = map.entities.zoidrones.filter(
					zoidrone => zoidrone.loc.x === loc.x && zoidrone.loc.y === loc.y
				)[0]
				if (zoidrone.mode === 'waking') {
					player.score += 50
				} else {
					player.score += 10
				}
				removeEntity(map, 'zoidrones', loc)
				player.loc = loc
				return true
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
			case 'pod':
				map.maze[loc.y][loc.x] = 'space'
				zoidDrop(map, zoid.loc)
				zoid.loc = loc
				return true
			case 'clover':
				zoid.clovers++
				removeEntity(map, 'clovers', loc)
				zoidDrop(map, zoid.loc)
				zoid.loc = loc
				return true
			case 'player':
				playerSystem.getPlayer().dead = true
				return true
		}
	} else if (entity.type === 'bullet') {
		let zap = entity // Renamed for clarity
		switch (itemAt(map, loc)) {
			case 'space':
				zap.loc = loc
				return true
			case 'pod':
				map.maze[loc.y][loc.x] = 'space'
				zap.loc = loc
				return true
			case 'clover':
				removeEntity(map, 'clovers', loc)
				map.entities.players[0].clovers++
				break
			case 'player':
				if (!playerSystem.getPlayer().shield) {
					playerSystem.getPlayer().dead = true
				}
				break
			case 'zoid':
				let zoid = map.entities.zoids.filter(
					zoid => zoid.loc.x === loc.x && zoid.loc.y === loc.y
				)[0]
				if (zoid.clovers > 0) {
					zoid.clovers-- //TODO: make more complex
					map.entities.players[0].clovers++
				} else {
					removeEntity(map, 'zoids', zoid.loc)
				}
				break
			case 'mine':
				let mine = map.entities.mines.filter(
					mine => mine.loc.x === loc.x && mine.loc.y === loc.y
				)[0]
				mine.explode()
				break
			default:
				if (isShootableWall(map, loc)) {
					map.maze[loc.y][loc.x] = 'space'
				}
				console.log(itemAt(map, loc))
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

function explode(map, loc) {
	switch (itemAt(map, loc)) {
		case 'outside':
			break
		case 'clover':
			removeEntity(map, 'clovers', loc)
			map.entities.players[0].clovers++
			break
		case 'zoidrone':
			removeEntity(map, 'zoidrones', loc)
			break
		case 'player':
			playerSystem.getPlayer().dead = true
			break
		case 'zoid':
			let zoid = map.entities.zoids.filter(
				zoid => zoid.loc.x === loc.x && zoid.loc.y === loc.y
			)[0]
			map.entities.players[0].clovers += zoid.clovers
			removeEntity(map, 'zoids', zoid.loc)
			break
		case 'mine':
			let mine = map.entities.mines.filter(
				mine => mine.loc.x === loc.x && mine.loc.y === loc.y
			)[0]
			mine.explode()
		default:
			if (!isEdgeWall(map, loc)) {
				map.maze[loc.y][loc.x] = 'space'
			}
			console.log(itemAt(map, loc))
	}
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
		if (match === false) {
			takenPoints.push(point)
			return point
		}
	}
}

function removeEntity(map, entityType, loc) {
	for (let i = 0; i < map.entities[entityType].length; i++) {
		if (
			map.entities[entityType][i].loc.x == loc.x &&
			map.entities[entityType][i].loc.y == loc.y
		) {
			map.entities[entityType].splice(i, 1)
		}
	}
}

module.exports = {
	createMap: createMap,
	simulate: simulate,
	simulateReal: simulateReal
}
