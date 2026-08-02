// Server URL configuration
const SERVER_URL = 'https://zoirinth.schwabtogether.com'

let _username = ''

function addScore(username, gameStats) {
	// Prepare score data to send to server
	const scoreData = {
		username: username,
		score: gameStats.score,
		level: gameStats.level,
		//time: gameStats.time,
		date: new Date().toISOString()
	}

	// Send score to server using fetch
	fetch(`${SERVER_URL}/api/addScore`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(scoreData)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			return response.json()
		})
		.then(data => {
			console.log('Score added successfully:', data)
		})
		.catch(error => {
			console.error('Error adding score:', error)
		})
}

function getScores() {
	const table = $('#highscores')

	// Fetch scores from server
	fetch(`${SERVER_URL}/api/getScores`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			return response.json()
		})
		.then(scores => {
			// Sort scores by score (descending) and limit to top 10
			const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10)

			// Clear existing table rows
			table.empty()

			// Add header row
			const headerRow = $('<tr>')
			headerRow.append('<th>Rank</th>')
			headerRow.append('<th>Name</th>')
			headerRow.append('<th>Score</th>')
			headerRow.append('<th>Level</th>')
			headerRow.append('<th>Date</th>')
			table.append(headerRow)

			// Add score rows
			topScores.forEach((score, index) => {
				const row = $('<tr>')
				row.append(`<td>${index + 1}</td>`)
				row.append(`<td>${score.username}</td>`)
				row.append(`<td>${score.score}</td>`)
				row.append(`<td>${score.level}</td>`)
				row.append(`<td>${new Date(score.date).toLocaleDateString()}</td>`)
				table.append(row)
			})
		})
		.catch(error => {
			console.error('Error getting scores:', error)
			// Show error in table
			table.html('<tr><td colspan="5">Failed to load scores</td></tr>')
		})
}

function highscoresNameInput(event, gameStats) {
	const nameField = $('#namefield')
	if (!nameField) {
		return
	}

	// Handle alphanumeric characters (with shift for capital letters)
	if (
		(event.code >= 'KeyA' && event.code <= 'KeyZ') ||
		(event.code >= 'Digit0' && event.code <= 'Digit9') ||
		(event.code === 'Space')
	) {
		// Check for char limit
		if (_username.length >= 20) {
			// Play sound? Do nothing
		}
		// Check if shift is held down for capital letters
		else if (event.code === 'Space') {
			_username += " "
		} else if (event.shiftKey) {
			// For letters, we need to get the uppercase version
			if (event.code >= 'KeyA' && event.code <= 'KeyZ') {
				_username += event.key.toUpperCase()
			} else {
				_username += event.key
			}
		} else {
			// For lowercase letters or numbers
			_username += event.key.toLowerCase()
		}
		nameField.html(_username)
	}
	// Handle backspace
	else if (event.code === 'Backspace') {
		if (_username.length > 0) {
			_username = _username.slice(0, -1)
			nameField.html(_username)
		}
	}
	// Handle enter key to submit
	else if (event.code === 'Enter') {
		if (_username.trim() !== '') {
			// Submit score
			addScore(_username, gameStats)
			return true
		}
	}
	return false
}

module.exports = {
	highscoresNameInput,
	getScores
}
