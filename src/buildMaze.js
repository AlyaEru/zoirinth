const util = require('./utilities')
const dir = require('./directions')

let width, height
let straightness = 0.5
let ratioWeak = 0.5

function buildMaze(w, h) {
	width = w
	height = h
	return setWalls(convertMaze(createMaze()))
}

function untouched(mazePoint) {
	return mazePoint.l && mazePoint.r && mazePoint.u && mazePoint.d
}

function canGo(maze, point) {
	return (
		point.x >= 0 &&
		point.y >= 0 &&
		point.x < width &&
		point.y < height &&
		untouched(maze[point.y][point.x])
	)
}

function createMaze() {
	let maze = []
	for (i = 0; i < height; i++) {
		let mazeRow = []
		for (j = 0; j < width; j++) {
			mazeRow.push(dir.getPoint())
		}
		maze.push(mazeRow)
	}

	previousDirection = util.randElem(dir.dirs)
	let loc = {
		x: util.randInt(width),
		y: util.randInt(height)
	}

	let explored = 1 //count initial location
	while (explored < height * width) {
		let possibleDirections = dir.dirs.filter(
			direction => direction != dir.opposite(previousDirection)
		)

		let direction = previousDirection
		if (Math.random() > straightness) {
			let possibleOtherDirections = possibleDirections.filter(
				dir => dir != previousDirection
			)

			direction = util.randElem(possibleOtherDirections)
		}

		newLoc = dir.move(loc, direction)
		let trapped = false
		while (!canGo(maze, newLoc)) {
			possibleDirections = possibleDirections.filter(dir => dir != direction)
			if (possibleDirections.length == 0) {
				//if there are no possibilities, break and branch from elsewhere
				trapped = true
				break
			}
			direction = util.randElem(possibleDirections)
			newLoc = dir.move(loc, direction)
		}

		if (trapped) {
			while (true) {
				loc = {
					x: util.randInt(width),
					y: util.randInt(height)
				}
				previousDirection = util.randElem(dir.dirs)
				if (!untouched(maze[loc.y][loc.x])) {
					break
				}
			}
		} else {
			maze[loc.y][loc.x][direction] = false
			maze[newLoc.y][newLoc.x][dir.opposite(direction)] = false
			loc = newLoc
			explored++
			previousDirection = direction
		}
	}

	return maze
}

function convertMaze(maze) {
	let map = []
	let mapWidth = width * 2 + 1
	let mapHeight = height * 2 + 1

	for (i = 0; i < mapHeight; i++) {
		let mapRow = []
		for (j = 0; j < mapWidth; j++) {
			if (i % 2 == 0 || j % 2 == 0) {
				mapRow.push('w')
			} else mapRow.push(' ')
		}
		map.push(mapRow)
	}

	for (i = 0; i < height; i++) {
		for (j = 0; j < width; j++) {
			if (!maze[i][j].u) {
				map[i * 2][j * 2 + 1] = ' '
			}
			if (!maze[i][j].d) {
				map[i * 2 + 2][j * 2 + 1] = ' '
			}
			if (!maze[i][j].l) {
				map[i * 2 + 1][j * 2] = ' '
			}
			if (!maze[i][j].r) {
				map[i * 2 + 1][j * 2 + 2] = ' '
			}
		}
	}

	return map
}

function setWalls(map) {
	mapCopy = JSON.parse(JSON.stringify(map)) // No need to do this. Should be removed.
	for (i = 0; i < height * 2 + 1; i++) {
		for (j = 0; j < width * 2 + 1; j++) {
			if (map[i][j] == 'w') {
				wallString = ''
				if (map[i - 1] && map[i - 1][j] == 'w') {
					wallString += 'u'
				}
				if (map[i + 1] && map[i + 1][j] == 'w') {
					wallString += 'd'
				}
				if (map[i][j - 1] == 'w') {
					wallString += 'l'
				}
				if (map[i][j + 1] == 'w') {
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

module.exports = {
	build: buildMaze
}
