const mapSystem = require('./map')
const renderMap = require('./renderMap')
const playerSystem = require('./player')
const util = require('./utilities')

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
	renderMap.launch(map.simulateReal())
	let player = playerSystem.getPlayer()
	await levelLoop(map, player, level)
	return player.dead
}

async function levelLoop(map, player, level) {
	const clockSpeed = 30

	let zoidIndex = 0
	while (!player.escaped && !player.dead) {
		if (!player.menu && !player.awaitBegin) {
			for (let actor of map.actors) {
				if (Array.isArray(actor)) {
					if (actor.length > 0) {
						zoidIndex %= actor.length
						await doNextAction(actor[zoidIndex])
						zoidIndex++
					}
				} else {
					await doNextAction(actor)
				}
			}

			if (player.clovers === map.clovers) {
				map.generateExit()
				player.clovers = 0
			}

			renderMap.render(map.simulateReal())
			renderMap.renderScore(player.score)
			renderMap.renderLevel(level)
		}

		await util.wait(clockSpeed)
	}
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
