async function manageGame(mazeWidth, mazeHeight) {
	let score = 10
	let level = 1
	while(true) {
		score = await playLevel(level, score, mazeWidth, mazeHeight)
		if (score === false) { //died
			break
		}
		level++
	}
	console.log('dead')
}

async function playLevel(level, score, mazeWidth, mazeHeight) {
	let cloversCollected = 0
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
	const mapHeight = mazeHeight * 2 + 1
	const mapWidth = mazeWidth * 2 + 1
	const numClovers = level + 4
	const numZoids = level + 2

	let map = buildMaze(mazeWidth,mazeHeight,.5, 1 - ((level - 1) % 5)/4)
	function createZoids(numZoids) {
		let zoids = []

		for (let i = 0; i < numZoids; i++) {
			zoids.push({loc: randSpawnPoint(), type: 'zoid'})
		}
		return zoids
	}
	function createClovers(numClovers) {
		let clovers = []
		for (let i = 0; i < numClovers; i++) {
			clovers.push({loc: randSpawnPoint(), type: 'clover'})
		}
		return clovers
	}
	
	let player = {
		loc: randSpawnPoint(),
		runMode: true,
		clockSpeed: 20,
		score: score,
		shield: false,
		type: 'player',
		dead: false,
		escaped: false,
	}
	let zoids = createZoids(numZoids)
	let clovers = createClovers(numClovers)

	const actions = {
		go_r: () => {return go(player, 'r')},
		go_l: () => {return go(player, 'l')},
		go_u: () => {return go(player, 'u')},
		go_d: () => {return go(player, 'd')},
	}
	function getMapSimulation() {
		mapCopy = JSON.parse(JSON.stringify(map)) //deep clone map
		for (let i = 0; i < zoids.length; i++) {
			mapCopy[zoids[i].loc.y][zoids[i].loc.x] = 'zoid'
		}
		for (let i = 0; i < clovers.length; i++) {
			mapCopy[clovers[i].loc.y][clovers[i].loc.x] = 'clover'
		}
		mapCopy[player.loc.y][player.loc.x] = player.dead ? 'player_dead' : (player.shield ? 'player_shield' : 'player')
		return mapCopy
	}
	function removeItem(items, loc) {
		for (let i = 0; i < items.length; i++) {
			if (items[i].loc.x == loc.x && items[i].loc.y == loc.y ) {
				items.splice(i, 1)
			}
		}
	}
	function handleEntityMoveto(entity, loc) {
		let moved = false
		if (entity.type == 'player') {
			switch (itemAt(loc)) {
			case 'space':
				player.loc = loc
				moved = true
				break
			case 'clover': 
				removeItem(clovers, loc)
				player.score += 100
				cloversCollected++
				if (cloversCollected == numClovers) {
					generateExit()
				}
				player.loc = loc
				moved = true
				break
			case 'zoid': 
				player.dead = true
				break
			case 'lr_portal':
			case 'ud_portal':
				player.escaped = true
				break
				//handle winning here?
			}
		}
		renderGameboard(getMapSimulation())
		return moved
	}
	function go(entity, dir) {
		let runthrough = [
			'clover',
			'space',
			'pod',
			'superpod',
			'lr_portal',
			'ud_portal',
		]
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
		return new Promise(function(resolve, reject) {
			if (entity.runMode) {
				handleEntityMoveto(entity, locAt(entity.loc, dir))
				renderGameboard(getMapSimulation())
				function run() {
					if(runthrough.includes(lookNext(entity, dir)) && !runthrough.includes(lookNext(entity, rotateRight(dir))) && !runthrough.includes(lookNext(entity, rotateLeft(dir)))) {
						if (handleEntityMoveto(entity, locAt(entity.loc, dir))) {
							setTimeout(run, entity.clockSpeed)
						}
					}
					else resolve()
				}
				setTimeout(run, entity.clockSpeed)
			}
			else {
				handleEntityMoveto(entity, locAt(entity.loc, dir))
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
		if (!player.dead) {
			switch (e.code) {
			case 'ArrowDown':
			case 'KeyS':
				nextUserAction = actions.go_d
				break
			case 'ArrowUp':
			case 'KeyW':
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
			case 'KeyR':
				player.runMode = !player.runMode
				break
			}
		}
	};
	
	launchGameboard(getMapSimulation()) //first time launching the game board and setting the table width and height
	
	async function wait(ms) {
	    return new Promise(resolve => {
			setTimeout(resolve, ms);
	    });
	}
	async function playerLoop(game) {
		while (true) {
			await game()
			if (player.escaped || player.dead) {
				break
			}
			await wait(player.clockSpeed)
		}
	}
	await playerLoop(async function() {
		ua = nextUserAction
		nextUserAction = () => {}
		await ua()
	})
	
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
	if (player.escaped) {
		return player.score
	}
	else return false
}
