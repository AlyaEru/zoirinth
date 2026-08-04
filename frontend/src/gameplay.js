const mapSystem = require('./map')
const renderMap = require('./renderMap')
const renderMenu = require('./renderMenu')
const highscores = require('./highscores')
const playerSystem = require('./player')
const util = require('./utilities')
const shieldPointProb = require('./gameConstants').constants.shieldPointProb
const clockSpeed = require('./gameConstants').constants.clockSpeed

const gameStats = {
	level: 0,
	score: 10,
	time: 0
}
let startTime = 0

async function manageGame(width, height) {
	let died = false

	// these are used for highscores
	gameStats.level = 0
	gameStats.score = 10
	gameStats.time = 0
	startTime = 0

	// set up global keyboard listeners
	$(document)
		.off('keydown')
		.on('keydown', event => {
			if (died) {
				if (highscores.highscoresNameInput(event, gameStats)) {
					manageGame(width, height)
				}
			} else if ($('#modal').hasClass('show')) {
				renderMenu.modalEvent(event)
			} else {
				playerSystem.playerEvent(event)
			}
		})

	// first game menu before game start
	renderMenu.renderModalWelcome()

	// primary game loop
	while (!died) {
		gameStats.level++
		renderMenu.renderLevel(gameStats.level)
		died = await manageLevel(width, height, gameStats)
	}

	// calculate final run time
	gameStats.time += Date.now() - startTime

	// small delay to let the death sink in
	await util.wait(1000)
	renderMenu.renderModalGameover()
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
	let nextZoid = entityIterator(map.entities.zoids)
	let nextZoidrone = entityIterator(map.entities.zoidrones)
	while (!player.escaped && !player.dead) {
		if (!player.menu && !player.awaitBegin) {
			// time has to be handled using starts/ends to avoid losing time to calculations
			if (startTime == 0) {
				startTime = Date.now()
			}

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
			//renderMenu.renderTime(gameStats.time) tbd
			renderMenu.renderLevel(level)

		} else if (startTime > 0) {
			// update run clock
			gameStats.time += Date.now() - startTime
			startTime = 0 // prime for reset
		}
		
		let currentMoment = gameStats.time
		if(startTime>0) {currentMoment += (Date.now() - startTime)}
		renderMenu.renderPlayerInfo(player, currentMoment)
		await util.wait(clockSpeed)
	}
}

module.exports = {
	manageGame
}
