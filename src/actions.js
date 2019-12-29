function listen(player, simulateMapFunc, mapWidth, mapHeight) {
	let cloversCollected = 0
	let numClovers = clovers.length
	document.onkeydown = function (e) {
	e = e || window.event;
		switch (e.code) {
		case 'ArrowDown':
		case 'KeyS':
			player.actionQueue.push(() => go(player, 'd'))
			break
		case 'ArrowUp':
		case 'KeyW':
			player.actionQueue.push(() => go(player, 'u'))
			break
		case 'ArrowLeft':
		case 'KeyA':
			player.actionQueue.push(() => go(player, 'l'))
			break
		case 'ArrowRight':
		case 'KeyD':
			player.actionQueue.push(() => go(player, 'r'))
			break
		case 'KeyR':
			player.runMode = !player.runMode
			break
		}
	}
	
	function go(entity, dir) {
		//TODO: make zoid go
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
		if (entity.runMode) {
			if (handleEntityMoveto(entity, locAt(entity.loc, dir))) {
				if(runthrough.includes(lookNext(entity, dir)) && !runthrough.includes(lookNext(entity, rotateRight(dir))) && !runthrough.includes(lookNext(entity, rotateLeft(dir)))) {
					entity.actionQueue.unshift(() => go(entity, dir))
				}
			}
			
		}
		else {
			handleEntityMoveto(entity, locAt(entity.loc, dir))
		}
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
		//TODO: make this work with entity other than player
		if (entity.getType() == 'player') {
			switch (itemAt(loc)) {
			case 'space':
				player.loc = loc
				moved = true
				break
			case 'clover': 
				removeItem(clovers, loc)
				player.score += 100
				cloversCollected++
				if (cloversCollected === numClovers) {
					player.collectedClovers = true
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
		return moved
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
		else return simulateMapFunc()[loc.y][loc.x]
	}
}
