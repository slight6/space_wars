const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  create: (username, password, cb) => {
    db.run('INSERT INTO players (username, password) VALUES (?, ?)', [username, password], function(err) {
      if (err) return cb(err);
      db.get('SELECT * FROM players WHERE id = ?', [this.lastID], cb);
    });
  },
  findByUsername: (username, cb) => {
    db.get('SELECT * FROM players WHERE username = ?', [username], cb);
  },
  findById: (id, cb) => {
    db.get('SELECT * FROM players WHERE id = ?', [id], cb);
  },
  updateCredits: (id, credits, cb) => {
    db.run('UPDATE players SET credits = ? WHERE id = ?', [credits, id], cb);
  },
  updateReputation: (id, reputation, cb) => {
    db.run('UPDATE players SET reputation = ? WHERE id = ?', [reputation, id], cb);
  }
};
