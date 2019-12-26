function buildMaze(height, width, straightness, ratioWeak) {
	directions = ['l','r','u','d']
	function rand(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	function getMazePoint() {
		return {
			l: true,
			r: true,
			u: true,
			d: true,
		}
	}
	function opposite(direction) {
		switch(direction) {
		case 'l': return 'r'
		case 'r': return 'l'
		case 'u': return 'd'
		case 'd': return 'u'
		}
	}
	function go(start, direction) {
		switch(direction) {
		case 'l':
			return {x: start.x - 1, y: start.y}
		case 'r':
			return {x: start.x + 1, y: start.y}
		case 'u':
			return {x: start.x, y: start.y - 1}
		case 'd':
			return {x: start.x, y: start.y + 1}
		}
	}
	function untouched(mazePoint) {
		return mazePoint.l && mazePoint.r && mazePoint.u && mazePoint.d
	}
	
	function canGo(maze, point) {
		return point.x >= 0 && point.y >= 0 && point.x < width && point.y < height && untouched(maze[point.y][point.x])
	}

	
	
	function createMaze() {
		let maze = []
		for (i = 0; i < height; i++) {
			let mazeRow = []
			for (j = 0; j < width; j++) {
				mazeRow.push(getMazePoint())
			}
			maze.push(mazeRow)
		}
		previousDirection = directions[rand(4)]
		let loc = {
			x: rand(width),
			y: rand(height),
		}
		let explored = 1 //count initial location
		while (explored < height * width) {
			let possibleDirections = directions.filter(dir => dir != opposite(previousDirection))
			
			let direction = previousDirection
			if(Math.random() > straightness) {
				let possibleOtherDirections = possibleDirections.filter(dir => dir != previousDirection)
				
				direction = possibleOtherDirections[rand(possibleOtherDirections.length)]
			}
			newLoc = go(loc, direction)
			let trapped = false
			while (!canGo(maze, newLoc)) {
				possibleDirections = possibleDirections.filter(dir => dir != direction)
				if (possibleDirections.length == 0) {
					//if there are no possibilities, break and branch from elsewhere
					trapped = true
					break
				}
				direction = possibleDirections[rand(possibleDirections.length)]
				newLoc = go(loc, direction)
			}
			if(trapped) {
				while (true) {
					loc = {
						x: rand(width),
						y: rand(height),
					}
					previousDirection = directions[rand(4)]
					if(!untouched(maze[loc.y][loc.x])){
						break
					}
				}
			}
			else {
				maze[loc.y][loc.x][direction] = false
				maze[newLoc.y][newLoc.x][opposite(direction)] = false
				loc = newLoc
				explored++
				previousDirection = direction
			}
		}
		return maze
	}

	function convertMaze(maze, width, height) {
		let map = []
		let mapWidth = width * 2 + 1
		let mapHeight = height * 2 + 1
		for (i = 0; i < mapWidth; i++) {
			let mapRow = []
			for (j = 0; j < mapHeight ; j++) {
				if (i % 2 == 0 || j % 2 == 0) {
					mapRow.push('w')
				}
				else mapRow.push(' ')
			}
			map.push(mapRow)
		}
		
		for (i = 0; i < height; i++) {
			for (j = 0; j < width ; j++) {
				if (!maze[i][j].u) {
					map[i*2][j*2+1] = ' '
				}
				if (!maze[i][j].d) {
					map[i*2+2][j*2+1] = ' '
				}
				if (!maze[i][j].l) {
					map[i*2+1][j*2] = ' '
				}
				if (!maze[i][j].r) {
					map[i*2+1][j*2+2] = ' '
				}
			}
		}
		return map
	}
	
	function setWalls(map) {
		mapCopy = JSON.parse(JSON.stringify(map))
		for (i = 0; i < height * 2 + 1; i++) {
			for (j = 0; j < width * 2 + 1 ; j++) {
				if (map[i][j] == 'w') {
					wallString = ''
					if (map[i-1] && map[i-1][j] == 'w') {
						wallString += 'u'
					}
					if (map[i+1] && map[i+1][j] == 'w') {
						wallString += 'd'
					}
					if (map[i][j-1] == 'w') {
						wallString += 'l'
					}
					if (map[i][j+1] == 'w') {
						wallString += 'r'
					}
					if (Math.random() < ratioWeak) {
						wallString += '_weak'
					}
					mapCopy[i][j] = wallString
				}
				if (map[i][j] == ' ') {
					mapCopy[i][j] = 'space'
				}
			}
		}
		return mapCopy
	}
	return setWalls(convertMaze(createMaze(), width, height))
}