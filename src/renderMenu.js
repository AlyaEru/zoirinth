function renderPlayerInfo(player) {
	if (player.runMode != $('#runmode').hasClass('on'))
		$('#runmode').toggleClass('on off')
	if (player.shield != $('#shield').hasClass('on'))
		$('#shield').toggleClass('on off')
	//if (player.invisibility != $('#invisibility').hasClass('on')) $('#invisibility').toggleClass('on off');
}

function renderScore(score) {
	$('#points').text('Points: ' + score)
}

function renderLevel(level) {
	$('#level').text('Level: ' + level)
}

module.exports = {
	renderScore,
	renderLevel,
	renderPlayerInfo
}
