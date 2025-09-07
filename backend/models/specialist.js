const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  getAll: (cb) => {
    db.all('SELECT * FROM specialists', cb);
  },
  getById: (id, cb) => {
    db.get('SELECT * FROM specialists WHERE id = ?', [id], cb);
  }
};
