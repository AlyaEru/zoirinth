const mapSystem = require('./map')
const renderMap = require('./renderMap')
const playerSystem = require('./player')
const util = require('./utilities')

const shieldPointProb = 0.1

async function manageGame(width, height) {
	const gameStats = {
		level: 0,
		score: 10
	}
	let died = false
	while (!died) {
		gameStats.level++
		renderMap.renderLevel(gameStats.level)
		died = await manageLevel(width, height, gameStats)
	}

	// High scores?
}

async function manageLevel(width, height, gameStats) {
	let map = mapSystem.createMap(width, height, gameStats)
	renderMap.launch(map.simulateReal())
	let player = playerSystem.getPlayer()
	player.score = gameStats.score
	await levelLoop(map, player, gameStats.level)
	gameStats.score = player.score
	return player.dead
}

function entityIterator(entity) {
	let index = 0
	let next = function() {
		if (entity.length === 0) return false
		index++
		index %= entity.length
		return entity[index]
	}
	return next
}

async function levelLoop(map, player, level) {
	const clockSpeed = 30

	let nextZoid = entityIterator(map.entities.zoids)
	let nextZoidrone = entityIterator(map.entities.zoidrones)
	while (!player.escaped && !player.dead) {
		if (!player.menu && !player.awaitBegin) {
			await doNextAction(player)
			let zoid = nextZoid()
			if (zoid) {
				await doNextAction(zoid)
			}
			for (let zoidrone of map.entities.zoidrones) {
				await doNextAction(zoidrone)
			}
			for (let mine of map.entities.mines) {
				await doNextAction(mine)
			}

			if (player.shield) {
				if (Math.random() < shieldPointProb && !playerSystem.spendPoints(1)) {
					player.shield = false
				}
			}
			if (player.clovers === map.clovers) {
				map.generateExit()
				player.clovers = 0
			}

			renderMap.render(map.simulateReal())
			renderMap.renderScore(player.score)
			renderMap.renderLevel(level)
			renderMap.renderPlayerInfo(player)
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
