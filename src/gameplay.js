function playLevel(level, score, mazeWidth, mazeHeight) {
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
			if (!takenPoints.includes(point)) {
				return point
			}
		}
	}
	const mapHeight = mazeHeight * 2 + 1
	const mapWidth = mazeWidth * 2 + 1

	let map = buildMaze(mazeWidth,mazeHeight,.5, 1 - ((level - 1) % 5)/4)
	let player = {
		loc: randSpawnPoint(),
		runMode: true,
		clockSpeed: 20,
		score: score,
		shield: false,
	}
	function createZoids(numZoids) {
		let zoids = []

		for (let i = 0; i < numZoids; i++) {
			zoids.push({loc: randSpawnPoint()})
		}
		return zoids
	}
	let zoids = createZoids(3)

	function createClovers(numClovers) {
		let clovers = []
		for (let i = 0; i < numClovers; i++) {
			clovers.push({loc: randSpawnPoint()})
		}
		return clovers
	}
	let clovers = createClovers(5)

	renderGameboard(getMapSimulation())

	const actions = {
		go_r: () => {return go(player, 'r')},
		go_l: () => {return go(player, 'l')},
		go_u: () => {return go(player, 'u')},
		go_d: () => {return go(player, 'd')},
	}
	function rotateLeft(dir) {
		switch (dir) {
		case 'l':
			return 'd'
		case 'r':
			return 'u'
		case 'u':
			return 'l'
		case 'd':
			return 'r'
		}
	}
	function rotateRight(dir) {
		switch (dir) {
		case 'l':
			return 'u'
		case 'r':
			return 'd'
		case 'u':
			return 'r'
		case 'd':
			return 'l'
		}
	}
	function getMapSimulation() {
		mapCopy = JSON.parse(JSON.stringify(map)) //deep clone map
		for (let i = 0; i < zoids.length; i++) {
			mapCopy[zoids[i].loc.y][zoids[i].loc.x] = 'zoid'
		}
		for (let i = 0; i < clovers.length; i++) {
			mapCopy[clovers[i].loc.y][clovers[i].loc.x] = 'clover'
		}
		mapCopy[player.loc.y][player.loc.x] = player.shield ? 'player_shield' : 'player'
		return mapCopy
	}
	let runthrough = [
		'clover',
		'space',
		'pod',
		'superpod',
	]
	function removeItem(items, loc) {
		for (let i = 0; i < items.length; i++) {
			if (items[i].loc.x == loc.x && items[i].loc.y == loc.y ) {
				items.splice(i, 1)
			}
		}
	}
	function handlePlayerOn(loc) {
		switch (getMapSimulation()[loc.y][loc.x]) {
		case 'clover': 
			removeItem(clovers, loc)
			player.score += 100
			break
		}
	}
	function go(entity, dir) {
		return new Promise(function(resolve, reject) {
			if (entity.runMode) {
				if(lookNext(entity, dir) == 'space') {
					entity.loc = locAt(entity.loc, dir)
				}
				renderGameboard(getMapSimulation())
				function run() {
					if(runthrough.includes(lookNext(entity, dir)) && !runthrough.includes(lookNext(entity, rotateRight(dir))) && !runthrough.includes(lookNext(entity, rotateLeft(dir)))) {
						entity.loc = locAt(entity.loc, dir)
						setTimeout(run, entity.clockSpeed)
					}
					else resolve()
					renderGameboard(getMapSimulation())
				}
				setTimeout(run, entity.clockSpeed)
			}
			else {
				if(lookNext(entity, dir) == 'space') {
					entity.loc = locAt(entity.loc, dir)
				}
				renderGameboard(getMapSimulation())
				resolve()
			}
		})
	}
	function locAt(loc, dir) {
		switch(dir) {
		case 'l':
			return {x: loc.x - 1, y: loc.y}
		case 'r':
			return {x: loc.x + 1, y: loc.y}
		case 'u':
			return {x: loc.x, y: loc.y - 1}
		case 'd':
			return {x: loc.x, y: loc.y + 1}
		}
	}
	function lookNext(entity, dir) {
		return itemAt(locAt(entity.loc, dir))
	}
	function itemAt(loc){
		if (loc.x < 0 || loc.x > mapWidth) {
			return 'outside'
		}
		else if (loc.y < 0 || loc.y > mapHeight) {
			return 'outside'
		}
		else return getMapSimulation()[loc.y][loc.x]
	}

	let nextUserAction = () => {} //could make queue to queue actions
	document.onkeydown = function (e) {
		e = e || window.event;
		switch (e.code) {
		case 'ArrowDown':
		case 'KeyW':
			nextUserAction = actions.go_d
			break
		case 'ArrowUp':
		case 'KeyS':
			nextUserAction = actions.go_u
			break
		case 'ArrowLeft':
		case 'KeyA':
			nextUserAction = actions.go_l
			break
		case 'ArrowRight':
		case 'KeyD':
			nextUserAction = actions.go_r
			break
		}
	};

	async function playerLoop(game) {
		await game()
		setTimeout(playerLoop, player.clockSpeed, game);
		
	}
	
	launchGameboard(getMapSimulation()) //first time launching the game board and setting the table width and height
	
	playerLoop(async function() {
		ua = nextUserAction
		nextUserAction = () => {}
		await ua()
	})
}
