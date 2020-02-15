const actionQueueSystem = require('./actionQueue')
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
		awaitBegin: true
	}

	player.getClass = () => {
		if (player.dead) {
			return 'player_dead'
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
	switch (event.code) {
		case 'ArrowDown':
		case 'KeyS':
			if (player.menu) {
				playerShoot(map, 'd')
			} else {
				player.actionQueue.push(() => {
					map.moveEntity(player, 'd')
				})
			}
			break
		case 'ArrowUp':
		case 'KeyW':
			if (player.menu) {
				playerShoot(map, 'u')
			} else {
				player.actionQueue.push(() => {
					map.moveEntity(player, 'u')
				})
			}
			break
		case 'ArrowLeft':
		case 'KeyA':
			if (player.menu) {
				playerShoot(map, 'l')
			} else {
				player.actionQueue.push(() => {
					map.moveEntity(player, 'l')
				})
			}
			break
		case 'ArrowRight':
		case 'KeyD':
			if (player.menu) {
				playerShoot(map, 'r')
			} else {
				player.actionQueue.push(() => {
					map.moveEntity(player, 'r')
				})
			}
			break
		case 'KeyR':
			player.runMode = !player.runMode
			break
		case 'KeyQ':
			player.shield = !player.shield
			break
		case 'Enter':
			player.menu = !player.menu
			break
		case 'Space':
			shootNearestZoid(map)
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
