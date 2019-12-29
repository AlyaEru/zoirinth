const buildMaze = require('./buildMaze')
const renderMap = require('./renderMap')
const actions = require('./actions')
const util = require('./utilities')

let mazeWidth, mazeHeight

function getMapSimulation(map, ...entities) {
	mapCopy = JSON.parse(JSON.stringify(map)) //deep clone map
	for (let entity of entities) {
		for (let i = 0; i < entity.length; i++) {
			mapCopy[entity[i].loc.y][entity[i].loc.x] = entity[i].getType()
		}
	}
	return mapCopy
}

function initializeMap(player, numClovers, numZoids, width, height, level) {
	mazeWidth = width
	mazeHeight = height

	let map = buildMaze.build(
		mazeWidth,
		mazeHeight,
		0.5,
		1 - ((level - 1) % 5) / 4
	)

	zoids = createZoids(numZoids)
	clovers = createClovers(numClovers)
	player.loc = randSpawnPoint()
	score = player.score

	renderMap.launch(getMapSimulation(map, [player], zoids, clovers)) //first time launching the game board and setting the table width and height
	return map
}

function randSpawnPoint() {
	let takenPoints = []
	while (true) {
		point = {
			x: util.rand(mazeWidth) * 2 + 1,
			y: util.rand(mazeHeight) * 2 + 1
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

function createZoids(numZoids) {
	let zoids = []

	for (let i = 0; i < numZoids; i++) {
		zoids.push({
			loc: randSpawnPoint(),
			getType: () => 'zoid',
			clovers: 0,
			actionQueue: [],
			mode: '',
			dir: ''
		})
		zoids[i].actionQueue.push(actions.zoidAction(zoids[i]))
	}
	return zoids
}

function createClovers(numClovers) {
	let clovers = []

	for (let i = 0; i < numClovers; i++) {
		clovers.push({
			loc: randSpawnPoint(),
			getType: () => 'clover'
		})
	}
	return clovers
}

module.exports = {
	initializeMap: initializeMap,
	getMapSimulation: getMapSimulation
}
