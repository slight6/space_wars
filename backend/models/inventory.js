const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  getByPlayer: (playerId, cb) => {
    db.all('SELECT * FROM inventory WHERE player_id = ?', [playerId], cb);
  },
  addItem: (playerId, itemId, quantity, cb) => {
    db.run('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)', [playerId, itemId, quantity], cb);
  },
  updateItem: (id, quantity, cb) => {
    db.run('UPDATE inventory SET quantity = ? WHERE id = ?', [quantity, id], cb);
  },
  removeItem: (id, cb) => {
    db.run('DELETE FROM inventory WHERE id = ?', [id], cb);
  }
};
