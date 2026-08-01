const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3001

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.use(express.json());
app.use(express.static('public'));

// GET /api/getScores - retrieve highscores
app.get('/api/getScores', (req, res) => {
  const highscoresPath = path.join(__dirname, 'highscores')
  fs.readFile(highscoresPath, 'utf8', (err, data) => {
    if (err) {
      // If file doesn't exist, return empty array
      if (err.code === 'ENOENT') {
        res.send('[]')
        return
      }
      res.status(500).send('Error reading highscores')
      return
    }
    res.send(data)
  })
})

// POST /api/addScore - add new highscore
app.post('/api/addScore', (req, res) => {
  const {username, score, level, date} = req.body
  if (!username || !score || !level || !date) {
    res.status(400).send('All fields required')
    return
  }
  const highscoresPath = path.join(__dirname, 'highscores')
  const highscoreEntry = JSON.stringify({username, score, level, date}) + '\n'
  fs.appendFile(highscoresPath, highscoreEntry, err => {
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
