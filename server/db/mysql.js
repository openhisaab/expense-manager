const mysql = require('mysql2/promise');

class MySQLAdapter {
  constructor(config = {}) {
    this.name = 'MySQL';
    this.connectionString = config.connectionString || process.env.DATABASE_URL;
    this.pool = null;
  }

  async connect() {
    const config = this.connectionString
      ? { uri: this.connectionString }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || 'root',
          database: process.env.DB_NAME || 'openhisaab',
          waitForConnections: true,
          connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
          queueLimit: 0
        };

    this.pool = mysql.createPool(config);
    await this.initSchema();
  }

  async initSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(16) NOT NULL,
        amount DECIMAL(14, 2) NOT NULL,
        date DATETIME NOT NULL,
        party VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tx_date (date),
        INDEX idx_tx_type (type),
        INDEX idx_tx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  async healthCheck() {
    if (!this.pool) return false;
    const [rows] = await this.pool.query('SELECT 1 AS alive');
    return rows.length > 0;
  }

  async getAll(filters = {}) {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (filters.type && filters.type !== 'ALL') {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.category && filters.category !== 'ALL') {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    if (filters.search) {
      query += ' AND (party LIKE ? OR note LIKE ? OR category LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY date DESC';
    const [rows] = await this.pool.query(query, params);
    return rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount),
      date: new Date(r.date).toISOString().slice(0, 16)
    }));
  }

  async getById(id) {
    const [rows] = await this.pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return { ...r, amount: parseFloat(r.amount), date: new Date(r.date).toISOString().slice(0, 16) };
  }

  async create(data) {
    const id = data.id || `tx-${Date.now()}`;
    const query = `
      INSERT INTO transactions (id, type, amount, date, party, category, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [id, data.type, data.amount, data.date, data.party, data.category, data.note || ''];
    await this.pool.query(query, params);
    return this.getById(id);
  }

  async update(id, data) {
    const query = `
      UPDATE transactions
      SET type = ?, amount = ?, date = ?, party = ?, category = ?, note = ?
      WHERE id = ?
    `;
    const params = [data.type, data.amount, data.date, data.party, data.category, data.note || '', id];
    const [res] = await this.pool.query(query, params);
    if (res.affectedRows === 0) return null;
    return this.getById(id);
  }

  async delete(id) {
    const [res] = await this.pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  async seed(records = []) {
    for (const r of records) {
      await this.pool.query(`
        INSERT IGNORE INTO transactions (id, type, amount, date, party, category, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [r.id, r.type, r.amount, r.date, r.party, r.category, r.note || '']);
    }
  }

  async close() {
    if (this.pool) await this.pool.end();
  }
}

module.exports = MySQLAdapter;
