const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  getByPlayer: (playerId, cb) => {
    db.all('SELECT * FROM missions WHERE player_id = ?', [playerId], cb);
  },
  accept: (playerId, specialistId, missionType, cb) => {
    const acceptedAt = new Date().toISOString();
    db.run('INSERT INTO missions (player_id, specialist_id, mission_type, status, accepted_at) VALUES (?, ?, ?, ?, ?)', [playerId, specialistId, missionType, 'active', acceptedAt], function(err) {
      if (err) return cb(err);
      db.get('SELECT * FROM missions WHERE id = ?', [this.lastID], cb);
    });
  },
  complete: (id, cb) => {
    const completedAt = new Date().toISOString();
    db.run('UPDATE missions SET status = ?, completed_at = ? WHERE id = ?', ['completed', completedAt, id], cb);
  }
};
