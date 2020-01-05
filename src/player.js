let player

function getPlayer() {
	return player
}

function createPlayer(map) {
	player = {
		actionQueue: [],
		runMode: true,
		score: 10,
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
	if (player.menu) {
		if (spendPoints(10)) {
			player.actionQueue.push(async function() {
				await map.shoot(player, dir)
			})
			player.menu = false
		}
	} else {
		player.actionQueue.push(() => map.moveEntity(player, dir))
	}
}

function playerEvent(map, event) {
	player.awaitBegin = false
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
		case 'KeyR':
			player.runMode = !player.runMode
			break
		case 'Enter':
			player.menu = !player.menu
			break
		default:
		// Do nothing
	}
}

module.exports = {
	createPlayer: createPlayer,
	getPlayer: getPlayer
}
