const mapSystem = require('./map')
const renderMap = require('./renderMap')
const renderMenu = require('./renderMenu')
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
		renderMenu.renderLevel(gameStats.level)
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
			await player.actionQueue.doAction()
			let zoid = nextZoid()
			if (zoid) {
				await zoid.actionQueue.doAction()
			}
			for (let zoidrone of map.entities.zoidrones) {
				await zoidrone.actionQueue.doAction()
			}
			for (let mine of map.entities.mines) {
				await mine.actionQueue.doAction()
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
			renderMenu.renderScore(player.score)
			renderMenu.renderLevel(level)
			renderMenu.renderPlayerInfo(player)
		}

		await util.wait(clockSpeed)
	}
}

module.exports = {
	manageGame: manageGame
}
