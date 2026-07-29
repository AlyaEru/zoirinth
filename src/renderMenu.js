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

function renderModalWelcome() {
	let content = `
		<li>&nbsp;_____&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp; </li>
		<li>|__&nbsp;&nbsp;&nbsp;|___|_|___|_|___| |_| |_&nbsp;</li>
		<li>|&nbsp;&nbsp;&nbsp;__| . | |&nbsp;&nbsp;_| |&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;_|&nbsp;&nbsp;&nbsp;|</li>
		<li>|_____|___|_|_| |_|_|_|_| |_|_|</li>
		<li>&nbsp; </li>
		<li class='menu-item'>Play &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="white-text">Enter</span></li>
		<li class='menu-item'>How to play &nbsp;&nbsp;&nbsp;<span class="white-text">H</span></li>
		<li class='menu-item'>Highscores &nbsp;&nbsp;&nbsp;&nbsp;<span class="white-text">S</span></li>
		<li>&nbsp; </li>`

	$('#modal ul').html(content)
	$('#modal').addClass('show')
	$('#modal').addClass('welcome')
}

function renderModalHowto() {}

function renderModalHighscores(highscores) {}

module.exports = {
	renderScore,
	renderLevel,
	renderPlayerInfo,
	renderModalWelcome,
	renderModalHowto,
	renderModalHighscores
}
