const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  getByPlayer: (playerId, cb) => {
    db.all('SELECT * FROM ships WHERE player_id = ?', [playerId], cb);
  },
  purchase: (playerId, shipType, customName, cb) => {
    const purchaseDate = new Date().toISOString();
    db.run('INSERT INTO ships (player_id, ship_type, custom_name, purchase_date) VALUES (?, ?, ?, ?)', [playerId, shipType, customName, purchaseDate], function(err) {
      if (err) return cb(err);
      db.get('SELECT * FROM ships WHERE id = ?', [this.lastID], cb);
    });
  }
};
