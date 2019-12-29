const simulateMap = require('./simulateMap.js')
const renderMap = require('./renderMap')
const actions = require('./actions')
const util = require('./utilities')

let clovers = []
let zoids = []
let player = {
	actionQueue: [],
	getType: () => {
		if (player.dead) {
			return 'player_dead'
		}
		if (player.shield) return 'player_shield'
		return 'player'
	},
	runMode: true,
	score: 10,
	shield: false,
	dead: false,
	escaped: false,
	clovers: 0
}
let map = [[]]

async function manageGame(mazeWidth, mazeHeight) {
	let level = 1
	while (true) {
		let died = await manageLevel(level, mazeWidth, mazeHeight)
		if (died) {
			//died
			break
		}
		player.escaped = false
		level++
	}
	console.log('dead')
	//high scores?
}

async function manageLevel(level, mazeWidth, mazeHeight) {
	const numClovers = level + 4
	const numZoids = 1 //level + 2

	map = simulateMap.initializeMap(
		player,
		numClovers,
		numZoids,
		mazeWidth,
		mazeHeight,
		level
	)
	actions.listen(map, player)
	await levelLoop(numClovers)
	return player.dead
}

async function levelLoop(numClovers) {
	const clockSpeed = 20
	let nextZoid = 0

	while (!player.escaped && !player.dead) {
		await doNextAction(player)

		if (zoids.length > 0) {
			await doNextAction(zoids[nextZoid])
			nextZoid++
			nextZoid = nextZoid % zoids.length
		}

		if (player.clovers === numClovers) {
			generateExit()
			player.clovers = 0
		}

		renderMap.render(
			simulateMap.getMapSimulation(map, [player], zoids, clovers)
		)

		await wait(clockSpeed)
	}
}

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

async function doNextAction(entity) {
	if (entity.actionQueue.length > 0) {
		action = entity.actionQueue[0]
		entity.actionQueue = entity.actionQueue.slice(1)
		await action()
	}
}

function generateExit() {
	const mapHeight = mazeHeight * 2 + 1
	const mapWidth = mazeWidth * 2 + 1

	let num = util.rand(mazeWidth * 2 + mazeHeight * 2)
	if (num < mazeWidth) {
		map[0][num * 2 + 1] = 'lr_portal'
	} else if (num < mazeWidth * 2) {
		map[mapHeight - 1][(num - mazeWidth) * 2 + 1] = 'lr_portal'
	} else if (num < mazeWidth * 2 + mazeHeight) {
		map[(num - 2 * mazeWidth) * 2 + 1][0] = 'ud_portal'
	} else {
		map[(num - 2 * mazeWidth - mazeHeight) * 2 + 1][mapWidth - 1] = 'ud_portal'
	}
}

module.exports = {
	manageGame: manageGame
}
