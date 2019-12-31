const mapSystem = require('./map')
const renderMap = require('./renderMap')
const playerSystem = require('./player')

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
	let player = playerSystem.getPlayer()
	await levelLoop(map, player)
	return player.dead
}

async function levelLoop(map, player) {
	const clockSpeed = 20

	let zoidIndex = 0
	while (!player.escaped && !player.dead) {
		for (let actor of map.actors) {
			if (Array.isArray(actor)) {
				await doNextAction(actor[zoidIndex])
				zoidIndex++
				zoidIndex %= actor.length
			} else {
				await doNextAction(actor)
			}
		}

		if (player.clovers === map.clovers) {
			map.generateExit()
		}

		renderMap.render(map.simulateReal())

		await wait(clockSpeed)
	}
}

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

async function doNextAction(actor) {
	// TODO: if there's more than one actor, shuffle through
	if (actor.actionQueue.length > 0) {
		action = actor.actionQueue[0]
		actor.actionQueue = actor.actionQueue.slice(1)
		await action()
	}
}

module.exports = {
	manageGame: manageGame
}
