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

let highscores = [];
let isDirty = false; // Flag to track if data needs to be written to disk

// Load existing scores on startup
const highscoresPath = path.join(__dirname, 'highscores');
fs.readFile(highscoresPath, 'utf8', (err, data) => {
  if (err && err.code === 'ENOENT') {
    highscores = [];
  } else if (err) {
    console.error('Error reading highscores:', err);
    highscores = [];
  } else {
    try {
      highscores = JSON.parse(data);
    } catch (parseErr) {
      highscores = [];
    }
  }
});

// GET /api/getScores - retrieve highscores
app.get('/api/getScores', (req, res) => {
  res.json(highscores); // Return in-memory array directly
});

// POST /api/addScore - add new highscore
app.post('/api/addScore', (req, res) => {
  const {username, score, level, date} = req.body;
  if (!username || !score || !level || !date) {
    res.status(400).send('All fields required');
    return;
  }
  
  // Add new score to in-memory array
  highscores.push({username, score, level, date});
  isDirty = true; // Mark that data needs to be saved
  
  // Save to disk asynchronously (non-blocking)
  if (isDirty) {
    fs.writeFile(highscoresPath, JSON.stringify(highscores, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error saving highscore:', writeErr);
        // Don't send error response here as we already sent success
      } else {
        isDirty = false; // Reset flag after successful save
      }
    });
  }
  
  res.send('Highscore saved');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
