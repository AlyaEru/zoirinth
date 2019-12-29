
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
}

async function manageGame(mazeWidth, mazeHeight) {
	let score = 10
	let level = 1
	while(true) {
		let died = await manageLevel(level, mazeWidth, mazeHeight)
		if (died) { //died
			break
		}
		level++
	}
	console.log('dead')
	//high scores?
}

async function manageLevel(level, mazeWidth, mazeHeight) {
	
	
	const mapHeight = mazeHeight * 2 + 1
	const mapWidth = mazeWidth * 2 + 1
	const numClovers = level + 4
	const numZoids = level + 2
	
	map = initializeMap(numClovers, numZoids, mazeWidth, mazeHeight)
	listen(player, () => getMapSimulation(map, [player], zoids, clovers), mapWidth, mapHeight)
	
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