
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const Player = require('./models/player');
const Ship = require('./models/ship');
const Inventory = require('./models/inventory');
const Specialist = require('./models/specialist');
const Mission = require('./models/mission');
const Location = require('./models/location');
const Resource = require('./models/resource');
const Marketplace = require('./models/marketplace');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve game.html
app.get('/game.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../game.html'));
});

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    Player.create(username, hashedPassword, (err, player) => {
      if (err) return res.status(400).json({ success: false, message: 'Username taken' });
      // Generate a simple token (for demo, not secure)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      res.json({ success: true, token, player });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  Player.findByUsername(username, async (err, player) => {
    if (err || !player) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    try {
      const match = await bcrypt.compare(password, player.password);
      if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      const { password: _, ...userData } = player;
      // Generate a simple token (for demo, not secure)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      res.json({ success: true, token, player: userData });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  });
});

// Player info
app.get('/api/player/:username', (req, res) => {
  Player.findByUsername(req.params.username, (err, player) => {
    if (err || !player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  });
});

// Ships
app.get('/api/ships/:playerId', (req, res) => {
  Ship.getByPlayer(req.params.playerId, (err, ships) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(ships);
  });
});
app.post('/api/ships/purchase', (req, res) => {
  const { playerId, shipType, customName } = req.body;
  Ship.purchase(playerId, shipType, customName, (err, ship) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(ship);
  });
});

// Inventory
app.get('/api/inventory/:playerId', (req, res) => {
  Inventory.getByPlayer(req.params.playerId, (err, items) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(items);
  });
});
app.post('/api/inventory/add', (req, res) => {
  const { playerId, itemId, quantity } = req.body;
  Inventory.addItem(playerId, itemId, quantity, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});
app.post('/api/inventory/update', (req, res) => {
  const { id, quantity } = req.body;
  Inventory.updateItem(id, quantity, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});
app.post('/api/inventory/remove', (req, res) => {
  const { id } = req.body;
  Inventory.removeItem(id, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// Specialists
app.get('/api/specialists', (req, res) => {
  Specialist.getAll((err, specialists) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(specialists);
  });
});
app.get('/api/specialists/:id', (req, res) => {
  Specialist.getById(req.params.id, (err, specialist) => {
    if (err || !specialist) return res.status(404).json({ error: 'Not found' });
    res.json(specialist);
  });
});

// Missions
app.get('/api/missions/:playerId', (req, res) => {
  Mission.getByPlayer(req.params.playerId, (err, missions) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(missions);
  });
});
app.post('/api/missions/accept', (req, res) => {
  const { playerId, specialistId, missionType } = req.body;
  Mission.accept(playerId, specialistId, missionType, (err, mission) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(mission);
  });
});
app.post('/api/missions/complete', (req, res) => {
  const { id } = req.body;
  Mission.complete(id, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// Locations
app.get('/api/locations', (req, res) => {
  Location.getAll((err, locations) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(locations);
  });
});
app.get('/api/locations/:id', (req, res) => {
  Location.getById(req.params.id, (err, location) => {
    if (err || !location) return res.status(404).json({ error: 'Not found' });
    res.json(location);
  });
});

// Resources
app.get('/api/resources/:locationId', (req, res) => {
  Resource.getByLocation(req.params.locationId, (err, resources) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(resources);
  });
});
app.post('/api/resources/add', (req, res) => {
  const { name, type, amount, locationId } = req.body;
  Resource.add(name, type, amount, locationId, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});
app.post('/api/resources/update', (req, res) => {
  const { id, amount } = req.body;
  Resource.updateAmount(id, amount, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// Marketplace
app.get('/api/marketplace', (req, res) => {
  Marketplace.getAll((err, listings) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(listings);
  });
});
app.post('/api/marketplace/create', (req, res) => {
  const { itemId, sellerId, price, quantity } = req.body;
  Marketplace.create(itemId, sellerId, price, quantity, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});
app.post('/api/marketplace/buy', (req, res) => {
  const { id, buyerId } = req.body;
  Marketplace.buy(id, buyerId, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Space Wars backend running on port ${PORT}`);
});
