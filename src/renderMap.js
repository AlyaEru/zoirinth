const util = require('./utilities')

function launchGameboard(maze) {
	let height = maze.length
	let width = maze[0].length

	let table = ''
	for (let i = 0; i < height; i++) {
		//rows
		//start row
		let row = ''
		for (let j = 0; j < width; j++) {
			//columns
			//add item
			row += '<td class="' + maze[i][j] + '"></td>'
		}
		//end row
		table += '<tr>' + row + '</tr>'
	}
	$('table#gameboard').html(table)
}

function renderGameboard(maze) {
	let width = maze[0].length
	let i = 0

	$('table#gameboard tr td').each(function() {
		//processing this cell
		let currentCell = maze[Math.floor(i / width)][i % width]

		let classes = $(this)
			.attr('class')
			.split(' ')

		if (!$(this).hasClass(currentCell)) {
			for (j = 0; j < classes.length; j++) {
				if (!classes[j].includes('explode')) {
					classes[j] = ''
				} else {
					console.log(classes[j])
				}
			}

			$(this).attr('class', classes.join(' ') + ' ' + currentCell)
		}

		i++
	})
}

function renderExplosion(x, y, explodeTime) {
	let explosion = util.shuffle([
		'explode1',
		'explode2',
		'explode3',
		'explode4',
		'explode5',
		'explode6',
		'explode7',
		'explode8',
		'explode9'
	])

	let width = $('table#gameboard tr:first td').length
	let height = $('table#gameboard tr').length

	let table = $('table#gameboard')[0]
	let k = 0
	for (i = -1; i <= 1; i++) {
		for (j = -1; j <= 1; j++) {
			if (y + i >= 0 && x + j >= 0 && y + i < height && x + j < width) {
				let cell = table.rows[y + i].cells[x + j] // This is a DOM "TD" element
				$(cell).addClass(explosion[k])
				k++
			}
		}
	}

	setTimeout(function() {
		k = 0
		for (i = -1; i <= 1; i++) {
			for (j = -1; j <= 1; j++) {
				if (y + i >= 0 && x + j >= 0 && y + i < height && x + j < width) {
					let cell = table.rows[y + i].cells[x + j] // This is a DOM "TD" element
					$(cell).removeClass(explosion[k])
					k++
				}
			}
		}
	}, explodeTime)
}

function renderBulletExplosion(x, y, explodeTime) {
	let width = $('table#gameboard tr:first td').length
	let height = $('table#gameboard tr').length

	let table = $('table#gameboard')[0]
	if (y >= 0 && x >= 0 && y < height && x < width) {
		let cell = table.rows[y].cells[x] // This is a DOM "TD" element
		$(cell).addClass('explode_bullet')
	}

	setTimeout(function() {
		if (y >= 0 && x >= 0 && y < height && x < width) {
			let cell = table.rows[y].cells[x] // This is a DOM "TD" element
			$(cell).removeClass('explode_bullet')
		}
	}, explodeTime)
}

module.exports = {
	launch: launchGameboard,
	render: renderGameboard,
	renderBulletExplosion: renderBulletExplosion,
	renderExplosion: renderExplosion
}
