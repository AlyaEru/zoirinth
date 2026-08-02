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

// Configuration
const MAX_SCORES = 30; // Maximum scores to keep per category (score and level)
const MAX_TOTAL_SCORES = MAX_SCORES * 2; // Maximum total scores to keep

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

// Helper function to keep only top scores
function keepTopScores(scores) {
  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);
  
  // Keep top MAX_SCORES scores
  const topScores = scores.slice(0, MAX_SCORES);
  
  // Sort by level (descending) 
  scores.sort((a, b) => b.level - a.level);
  
  // Keep top MAX_SCORES levels
  const topLevels = scores.slice(0, MAX_SCORES);
  
  // Combine and remove duplicates
  const combined = [...topScores, ...topLevels];
  const unique = [];
  const seen = new Set();
  
  for (const score of combined) {
    const key = `${score.username}-${score.score}-${score.level}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(score);
    }
  }
  
  // Return at most MAX_TOTAL_SCORES entries
  return unique.slice(0, MAX_TOTAL_SCORES);
}

// GET /api/getScores - retrieve highscores
app.get('/api/getScores', (req, res) => {
  res.json(highscores); // Return in-memory array directly
});

// POST /api/addScore - add new highscore
app.post('/api/addScore', (req, res) => {
  const {username, score, level, time, date} = req.body;
  if (!username || !score || !level || !time || !date) {
    res.status(400).send('All fields required');
    return;
  }
  
  // Add new score to in-memory array
  highscores.push({username, score, level, time, date});
  
  // Keep only top scores
  highscores = keepTopScores(highscores);
  
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
  
  res.json({ message: 'Highscore saved' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
