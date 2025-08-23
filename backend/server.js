const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// SQLite DB setup
const db = new sqlite3.Database('./spacewars.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if not exist
const setupSQL = `
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  credits INTEGER DEFAULT 100000,
  reputation INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER,
  ship_type TEXT,
  custom_name TEXT,
  purchase_date TEXT,
  FOREIGN KEY(player_id) REFERENCES players(id)
);
`;
db.exec(setupSQL, (err) => {
  if (err) console.error('Error setting up tables', err);
});

// API Endpoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.run('INSERT INTO players (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) return res.status(400).json({ error: 'Username taken' });
      res.json({ id: this.lastID, username, credits: 100000, reputation: 0 });
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM players WHERE username = ?', [username], async (err, row) => {
    if (err || !row) return res.status(401).json({ error: 'Invalid credentials' });
    try {
      const match = await bcrypt.compare(password, row.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      // Don't send password hash back
      const { password: _, ...userData } = row;
      res.json(userData);
    } catch (e) {
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// Get player ships
app.get('/api/ships/:playerId', (req, res) => {
  db.all('SELECT * FROM ships WHERE player_id = ?', [req.params.playerId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Purchase ship
app.post('/api/ships/purchase', (req, res) => {
  const { playerId, shipType, customName } = req.body;
  const purchaseDate = new Date().toISOString();
  db.run('INSERT INTO ships (player_id, ship_type, custom_name, purchase_date) VALUES (?, ?, ?, ?)', [playerId, shipType, customName, purchaseDate], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ id: this.lastID, playerId, shipType, customName, purchaseDate });
  });
});

// Get player info
app.get('/api/player/:username', (req, res) => {
  db.get('SELECT * FROM players WHERE username = ?', [req.params.username], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Player not found' });
    res.json(row);
  });
});

app.listen(PORT, () => {
  console.log(`Space Wars backend running on port ${PORT}`);
});
