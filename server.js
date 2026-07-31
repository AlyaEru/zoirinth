const express = require('express')
const fs = require('fs')
const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(express.static('public'))

// GET /highscores - retrieve highscores
app.get('/highscores', (req, res) => {
	fs.readFile('./highscores', 'utf8', (err, data) => {
		if (err) {
			res.status(500).send('Error reading highscores')
			return
		}
		res.send(data)
	})
})

// POST /highscores - add new highscore
app.post('/highscores', (req, res) => {
	const {username, score, level, date} = req.body
	if (!username || !score || !level || !date) {
		res.status(400).send('All fields required')
		return
	}
	const highscoreEntry = JSON.stringify({username, score, level, date}) + '\n'
	fs.appendFile('./highscores', highscoreEntry, err => {
		if (err) {
			res.status(500).send('Error writing highscore')
			return
		}
		res.send('Highscore saved')
	})
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
