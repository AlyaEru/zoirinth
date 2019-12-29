
let clovers = []
let zoids = []
let player = {
	actionQueue: [],
	getType: () => {
		if (player.dead) {
			return 'player_dead'
		}
		if (player.shield) return 'player_shield'
		return 'player'
	},
	runMode: true,
	score: 10,
	shield: false,
	dead: false,
	escaped: false,
	collectedClovers: false,
}

async function manageGame(mazeWidth, mazeHeight) {
	let score = 10
	let level = 1
	while(true) {
		let died = await manageLevel(level, mazeWidth, mazeHeight)
		if (died) { //died
			break
		}
		player.escaped = false
		level++
	}
	console.log('dead')
	//high scores?
}

async function manageLevel(level, mazeWidth, mazeHeight) {
	
	const mapHeight = mazeHeight * 2 + 1
	const mapWidth = mazeWidth * 2 + 1
	const numClovers = level + 4
	const numZoids = 0//level + 2
	
	map = initializeMap(numClovers, numZoids, mazeWidth, mazeHeight, level)
	listen(player, () => getMapSimulation(map, [player], zoids, clovers), mapWidth, mapHeight)
	
	function generateExit() {
		let num = rand(mazeWidth * 2 + mazeHeight * 2)
		if (num < mazeWidth) {
			map[0][num * 2 + 1] = 'lr_portal'
		}
		else if (num < mazeWidth * 2) {
			map[mapHeight - 1][(num - mazeWidth) * 2 + 1] = 'lr_portal'
		}
		else if (num < mazeWidth * 2 + mazeHeight) {
			map[(num - 2 * mazeWidth) * 2 + 1][0] = 'ud_portal'
		}
		else {
			map[(num - 2 * mazeWidth - mazeHeight) * 2 + 1][mapWidth - 1] = 'ud_portal'
		}
	}
	
	const clockSpeed = 20
	async function levelLoop() {
		async function wait(ms) {
			return new Promise(resolve => {
				setTimeout(resolve, ms);
			});
		}
		async function doNextAction(entity) {
			if (entity.actionQueue.length > 0) {
				await entity.actionQueue[0]()
				entity.actionQueue = entity.actionQueue.slice(1)
			}
		}
		let nextZoid = 0
		while (true) {
			await doNextAction(player)
			if (zoids.length > 0) {
				await doNextAction(zoids[nextZoid])
				nextZoid++
				nextZoid = nextZoid % zoids.length
			}
			if (player.collectedClovers) {
				generateExit()
				player.collectedClovers = false
			}
			renderGameboard(getMapSimulation(map, [player], zoids, clovers))
			if (player.escaped || player.dead) {
				break
			}
			await wait(clockSpeed)
		}
	}

	await levelLoop()
	return player.dead
}