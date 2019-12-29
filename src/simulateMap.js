function getMapSimulation(map, ...entities) {
	mapCopy = JSON.parse(JSON.stringify(map)) //deep clone map
	for (let entity of entities) {
		for (let i = 0; i < entity.length; i++) {
			mapCopy[entity[i].loc.y][entity[i].loc.x] = entity[i].getType()
		}
	}
	return mapCopy
}

function initializeMap(numClovers, numZoids, mazeWidth, mazeHeight) {
	let map = buildMaze(mazeWidth,mazeHeight,.5, 1 - ((level - 1) % 5)/4)
	
	function rand(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	
	let takenPoints = []
	function randSpawnPoint() {
		while (true) {
			point = {
				x: rand(mazeWidth) * 2 + 1,
				y: rand(mazeHeight) * 2 + 1,
			}
			let match = false
			for(takenPoint of takenPoints) {
				if (takenPoint.x == point.x && takenPoint.y == point.y) {
					match = true
				}
			}
			if (match == false) {
				takenPoints.push(point)
				return point
			}
		}
	}
	function createZoids(numZoids) {
		let zoids = []

		for (let i = 0; i < numZoids; i++) {
			zoids.push({
				loc: randSpawnPoint(), 
				getType: () => 'zoid',
				clovers: 0,
				actionQueue: [],
			})
		}
		return zoids
	}
	function createClovers(numClovers) {
		let clovers = []
		for (let i = 0; i < numClovers; i++) {
			clovers.push({
				loc: randSpawnPoint(), 
				getType: () => 'clover'
			})
		}
		return clovers
	}
	
	zoids = createZoids(numZoids)
	clovers = createClovers(numClovers)
	player.loc = randSpawnPoint()
	score = player.score
	
	launchGameboard(getMapSimulation(map, [player], zoids, clovers)) //first time launching the game board and setting the table width and height
	return map
}