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
		type: 'player'
	}

	player.getType = () => {
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

function playerEvent(map, event) {
	switch (event.code) {
		case 'ArrowDown':
		case 'KeyS':
			player.actionQueue.push(() => map.moveEntity(player, 'd'))
			break
		case 'ArrowUp':
		case 'KeyW':
			player.actionQueue.push(() => map.moveEntity(player, 'u'))
			break
		case 'ArrowLeft':
		case 'KeyA':
			player.actionQueue.push(() => map.moveEntity(player, 'l'))
			break
		case 'ArrowRight':
		case 'KeyD':
			player.actionQueue.push(() => map.moveEntity(player, 'r'))
			break
		case 'KeyR':
			player.runMode = !player.runMode
			break
		default:
		// Do nothing
	}
}

module.exports = {
	createPlayer: createPlayer,
	getPlayer: getPlayer
}
