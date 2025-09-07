const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

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
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER,
  item_id TEXT,
  quantity INTEGER,
  FOREIGN KEY(player_id) REFERENCES players(id)
);
CREATE TABLE IF NOT EXISTS specialists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  location TEXT
);
CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER,
  specialist_id INTEGER,
  mission_type TEXT,
  status TEXT,
  accepted_at TEXT,
  completed_at TEXT,
  FOREIGN KEY(player_id) REFERENCES players(id),
  FOREIGN KEY(specialist_id) REFERENCES specialists(id)
);
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT
);
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  type TEXT,
  amount INTEGER,
  location_id INTEGER,
  FOREIGN KEY(location_id) REFERENCES locations(id)
);
CREATE TABLE IF NOT EXISTS marketplace (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT,
  seller_id INTEGER,
  buyer_id INTEGER,
  price INTEGER,
  quantity INTEGER,
  status TEXT,
  created_at TEXT,
  completed_at TEXT,
  FOREIGN KEY(seller_id) REFERENCES players(id),
  FOREIGN KEY(buyer_id) REFERENCES players(id)
);
`;

db.exec(setupSQL, (err) => {
  if (err) console.error('Error setting up tables', err);
  else console.log('Database tables created/verified.');
  db.close();
});
