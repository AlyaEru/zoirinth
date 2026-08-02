const getScores = require('./highscores').getScores

function renderPlayerInfo(player) {
	// Initialize menu items if they don't exist
	let content = ""
	if (($('#left-menu').length <= 1) || (player.menu != $('#left-menu').hasClass('extended'))) {
		content = `
			<li data-hotkey="R" id="runmode" class="menu-item on">Run Mode</li>
			<li data-hotkey="Q" id="shield" class="menu-item off">Shield</li>
			<li data-hotkey="I" id="invisibility" class="menu-item off">Invisibility</li>
			<li data-hotkey="H"  class="menu-item">Hyperspace</li>
			<li data-hotkey="T"  class="menu-item">Superblast</li>
			<li data-hotkey="Space"  class="menu-item">Fire at zoid</li>
			<li>&nbsp; </li>
		`;
		if (player.menu) {
			$('#left-menu').addClass('extended')
			content += `
				<li data-hotkey="Left" class="menu-item">Shoot Left</li>
				<li data-hotkey="Right" class="menu-item">Shoot Right</li>
				<li data-hotkey="Up" class="menu-item">Shoot Up</li>
				<li data-hotkey="Down" class="menu-item">Shoot Down</li>
				<li>&nbsp; </li>
				<li data-hotkey="Enter" class="menu-item">Unpause</li>
			`
		} else {
			$('#left-menu').removeClass('extended')
			content += `
				<li data-hotkey="Enter" class="menu-item">Pause</li>
			`
		}
		$('#left-menu').html(content);
	}
	
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

function renderModalHowto() {
	let content = `<li>How To:</li><li>...not implemented...</li>`
	$('#modal ul').html(content)

	$('#modal').removeClass('welcome')
	$('#modal').addClass('show')
}

function renderModalHighscores() {
	// Create highscores table HTML
	let content = `
        <li>Highscores</li>
        <li>&nbsp; </li>
        <li><table id="highscores" class="highscore-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Level</th>
                    <th>Time</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <tr><td colspan="6">Loading...</td></tr>
            </tbody>
        </table></li>
        <li>&nbsp; </li>
        <li class='menu-item'>press Enter to return</li>
        <li>&nbsp; </li>
    `

	$('#modal ul').html(content)
	$('#modal').removeClass('welcome')
	$('#modal').addClass('show')

	// Load scores
	getScores()
}

function renderModalGameover() {
	let content = `
		<li>&nbsp;___ ___ _____ ___&nbsp;&nbsp;&nbsp;&nbsp;___ _ _ ___ ___&nbsp;</li>
		<li>| . | . |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| -_|&nbsp;&nbsp;| . | | | -_|&nbsp;&nbsp;_|</li>
		<li>|_&nbsp;&nbsp;|__,|_|_|_|___|&nbsp;&nbsp;|___|__/|___|_|&nbsp;&nbsp;</li>
		<li>|___|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
		<li>&nbsp; </li>
		<li>Name: <span id="namefield" class="white-text"></span><span class="cursorblink">_</span></li>
		<li class='menu-item'>press Enter to submit</li>
		<li>&nbsp; </li>`

	$('#modal ul').html(content)
	$('#modal').addClass('show')
	$('#modal').addClass('welcome')
}

function modalEvent(event) {
	switch (event.code) {
		case 'KeyH':
			renderModalHowto()
			break
		case 'KeyS':
			renderModalHighscores()
			break
		case 'Enter':
			if ($('#modal').hasClass('welcome')) {
				$('#modal').removeClass('show')
			} else {
				renderModalWelcome()
			}
			break
		default:
		// Do nothing
	}
}

module.exports = {
	renderScore,
	renderLevel,
	renderPlayerInfo,
	renderModalWelcome,
	renderModalHowto,
	renderModalGameover,
	renderModalHighscores,
	modalEvent
}
