const actionQueueSystem = require('./actionQueue')
const constants = require('./gameConstants').constants
let player

function getPlayer() {
	return player
}

function createPlayer(map) {
	player = {
		actionQueue: actionQueueSystem.make(),
		runMode: true,
		score: map.gameStats.score,
		shield: false,
		dead: false,
		escaped: false,
		clovers: 0,
		type: 'player',
		menu: false,
		awaitBegin: true,
		trapped: false
	}

	player.getClass = () => {
		if (player.dead) {
			return 'player_dead'
		} else if (player.trapped && player.shield) {
			return 'player_shield_trapped'
		} else if (player.trapped) {
			return 'player_trapped'
		} else if (player.shield) {
			return 'player_shield'
		} else {
			return 'player'
		}
	}

	$(document)
		.off('keydown')
		.on('keydown', event => {
			playerEvent(map, event)
		})

	map.spawnEntity(player)

	return player
}

// returns false if there aren't enough points to spend
function spendPoints(points) {
	if (player.score >= points) {
		player.score -= points
		return true
	}
	return false
}

function hyperspace(map) {
	if (spendPoints(constants.hyperspaceCost)) {
		let x, y
		while (true) {
			x = Math.floor(Math.random() * (map.width * 2 + 1))
			y = Math.floor(Math.random() * (map.height * 2 + 1))
			if (map.maze[y][x] === 'space') {
				break
			}
		}
		player.loc = {x, y}
	}
}

function hyperblast(map) {
	if (spendPoints(constants.hyperblastCost)) {
		const radius = 5
		let locs = []
		for (let x = -radius; x <= radius; x++) {
			for (let y = -radius; y <= radius; y++) {
				if (
					(x != 0 || y != 0) &&
					Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) <= radius
				) {
					if (Math.random() < 0.9) {
						locs.push({x: x, y: y})
					}
				}
			}
		}

		for (let loc of locs) {
			map.explode({x: player.loc.x + loc.x, y: player.loc.y + loc.y})
		}
	}
}

function playerShoot(map, dir) {
	if (spendPoints(10)) {
		player.actionQueue.push(async function() {
			await map.shoot(player, dir)
		})
		player.menu = false
	}
}

function shootNearestZoid(map) {
	//It needs to evaluate nearest zoid in the queue, not before adding to the queue. And cancel actions if dir is false.
	player.actionQueue.push(async function() {
		//find nearest zoid (if there is one)
		let dir = map.dirOfNearestEntity(player, 'zoid')
		if (dir && spendPoints(10)) {
			await map.shoot(player, dir)
		} else return player.actionQueue.skip
	})
}

function playerEvent(map, event) {
	player.awaitBegin = false

	if (player.trapped) {
		switch (event.code) {
			case 'ArrowDown':
			case 'KeyS':
			case 'ArrowUp':
			case 'KeyW':
			case 'ArrowLeft':
			case 'KeyA':
			case 'ArrowRight':
			case 'KeyD':
				if (Math.random() < constants.escapeTrapProb) {
					player.trapped = false
				}
		}
	} else if (player.menu) {
		switch (event.code) {
			case 'ArrowDown':
			case 'KeyS':
				playerShoot(map, 'd')
				break
			case 'ArrowUp':
			case 'KeyW':
				playerShoot(map, 'u')
				break
			case 'ArrowLeft':
			case 'KeyA':
				playerShoot(map, 'l')
				break
			case 'ArrowRight':
			case 'KeyD':
				playerShoot(map, 'r')
				break
		}
	} else {
		switch (event.code) {
			case 'ArrowDown':
			case 'KeyS':
				player.actionQueue.push(() => {
					map.moveEntity(player, 'd')
				})
				break
			case 'ArrowUp':
			case 'KeyW':
				player.actionQueue.push(() => {
					map.moveEntity(player, 'u')
				})
				break
			case 'ArrowLeft':
			case 'KeyA':
				player.actionQueue.push(() => {
					map.moveEntity(player, 'l')
				})
				break
			case 'ArrowRight':
			case 'KeyD':
				player.actionQueue.push(() => {
					map.moveEntity(player, 'r')
				})
				break
			case 'Space':
				shootNearestZoid(map)
				break
		}
	}
	switch (event.code) {
		case 'KeyR':
			player.runMode = !player.runMode
			break
		case 'KeyQ':
			player.shield = !player.shield
			break
		case 'Enter':
			player.menu = !player.menu
			break
		case 'KeyH':
			player.actionQueue.push(() => {
				hyperblast(map)
			})
			break
		case 'KeyT':
			player.actionQueue.push(() => {
				hyperspace(map)
			})
			break
		default:
		// Do nothing
	}
}

module.exports = {
	createPlayer,
	getPlayer,
	spendPoints
}
