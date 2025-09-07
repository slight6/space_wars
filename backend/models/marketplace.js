const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./spacewars.db');

module.exports = {
  getAll: (cb) => {
    db.all('SELECT * FROM marketplace', cb);
  },
  create: (itemId, sellerId, price, quantity, cb) => {
    const createdAt = new Date().toISOString();
    db.run('INSERT INTO marketplace (item_id, seller_id, price, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?)', [itemId, sellerId, price, quantity, 'active', createdAt], cb);
  },
  buy: (id, buyerId, cb) => {
    const completedAt = new Date().toISOString();
    db.run('UPDATE marketplace SET buyer_id = ?, status = ?, completed_at = ? WHERE id = ?', [buyerId, 'completed', completedAt, id], cb);
  }
};
