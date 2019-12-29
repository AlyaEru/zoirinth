function launchGameboard(maze){
	let height=maze.length
	let width=maze[0].length
	
	let table = ''
	for(let i=0; i<height; i++){ //rows
		//start row
		let row = ''
		for(let j=0; j<width; j++){ //columns
			//add item
			row+= '<td class="' + maze[i][j] + '"></td>'
		}
		//end row
		table += '<tr>' + row + '</tr>'
	}
	$('table#gameboard').html(table)
}

function renderGameboard(maze){
	let width=maze[0].length
	let i=0
	
	$('table#gameboard tr td').each(function(){
         //processing this cell
		let currentCell = maze[Math.floor(i/width)][i%width]
        if (!$(this).hasClass(currentCell)){
			$(this).removeClass()
			$(this).addClass(currentCell)
		}
		
		i++
	});
}