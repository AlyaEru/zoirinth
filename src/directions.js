const dirs = ['l', 'r', 'u', 'd']

function getPoint() {
	return {
		l: true,
		r: true,
		u: true,
		d: true
	}
}

function opposite(direction) {
	switch (direction) {
		case 'l':
			return 'r'
		case 'r':
			return 'l'
		case 'u':
			return 'd'
		case 'd':
			return 'u'
	}
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

function locAt(loc, dir) {
	switch (dir) {
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

function move(start, direction) {
	switch (direction) {
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

module.exports = {
	dirs: dirs,
	getPoint: getPoint,
	opposite: opposite,
	rotateLeft: rotateLeft,
	rotateRight: rotateRight,
	locAt: locAt,
	move: move
}
