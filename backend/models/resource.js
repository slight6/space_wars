const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  getByLocation: (locationId, cb) => {
    db.all('SELECT * FROM resources WHERE location_id = ?', [locationId], cb);
  },
  add: (name, type, amount, locationId, cb) => {
    db.run('INSERT INTO resources (name, type, amount, location_id) VALUES (?, ?, ?, ?)', [name, type, amount, locationId], cb);
  },
  updateAmount: (id, amount, cb) => {
    db.run('UPDATE resources SET amount = ? WHERE id = ?', [amount, id], cb);
  }
};
