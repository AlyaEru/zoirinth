const util = require('./utilities')
const mapSystem = require('./map')
const renderMap = require('./renderMap')

async function manageGame(width, height) {
	let level = 0
	let died = false
	while (!died) {
		level++
		died = await manageLevel(level, width, height)
	}

	// High scores?
}

async function manageLevel(level, width, height) {
	let map = mapSystem.createMap(width, height, level)
	renderMap.launch(map.maze)
	let player = map.getPlayer()
	await levelLoop(map, player)
	return player.dead
}

async function levelLoop(map, player) {
	const clockSpeed = 20

	while (!player.escaped && !player.dead) {
		for (let entity of map.entities) {
			await doNextAction(entity)
		}

		if (player.clovers == map.clovers) {
			map.generateExit()
		}

		renderMap.render(map.maze)

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

module.exports = {
	manageGame: manageGame
}
