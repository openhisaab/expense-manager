const { Pool } = require('pg');

class PostgresAdapter {
  constructor(config = {}) {
    this.name = config.isCockroach ? 'CockroachDB' : 'PostgreSQL';
    this.connectionString = config.connectionString || process.env.DATABASE_URL;
    this.pool = null;
  }

  async connect() {
    const config = this.connectionString 
      ? { connectionString: this.connectionString }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || (this.name === 'CockroachDB' ? '26257' : '5432')),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'openhisaab',
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        };

    this.pool = new Pool({
      ...config,
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    await this.initSchema();
  }

  async initSchema() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(64) PRIMARY KEY,
          type VARCHAR(16) NOT NULL,
          amount NUMERIC(14, 2) NOT NULL,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          party VARCHAR(255) NOT NULL,
          category VARCHAR(128) NOT NULL,
          note TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);`);
    } finally {
      client.release();
    }
  }

  async healthCheck() {
    if (!this.pool) return false;
    const res = await this.pool.query('SELECT 1 AS alive');
    return res.rows.length > 0;
  }

  async getAll(filters = {}) {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (filters.type && filters.type !== 'ALL') {
      params.push(filters.type);
      query += ` AND type = $${params.length}`;
    }

    if (filters.category && filters.category !== 'ALL') {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    if (filters.startDate) {
      params.push(filters.startDate);
      query += ` AND date >= $${params.length}`;
    }

    if (filters.endDate) {
      params.push(filters.endDate);
      query += ` AND date <= $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      const idx = params.length;
      query += ` AND (party ILIKE $${idx} OR note ILIKE $${idx} OR category ILIKE $${idx})`;
    }

    query += ' ORDER BY date DESC';
    const res = await this.pool.query(query, params);
    return res.rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount),
      date: new Date(r.date).toISOString().slice(0, 16)
    }));
  }

  async getById(id) {
    const res = await this.pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return { ...r, amount: parseFloat(r.amount), date: new Date(r.date).toISOString().slice(0, 16) };
  }

  async create(data) {
    const id = data.id || `tx-${Date.now()}`;
    const query = `
      INSERT INTO transactions (id, type, amount, date, party, category, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const params = [id, data.type, data.amount, data.date, data.party, data.category, data.note || ''];
    const res = await this.pool.query(query, params);
    const r = res.rows[0];
    return { ...r, amount: parseFloat(r.amount), date: new Date(r.date).toISOString().slice(0, 16) };
  }

  async update(id, data) {
    const query = `
      UPDATE transactions
      SET type = $1, amount = $2, date = $3, party = $4, category = $5, note = $6
      WHERE id = $7
      RETURNING *;
    `;
    const params = [data.type, data.amount, data.date, data.party, data.category, data.note || '', id];
    const res = await this.pool.query(query, params);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return { ...r, amount: parseFloat(r.amount), date: new Date(r.date).toISOString().slice(0, 16) };
  }

  async delete(id) {
    const res = await this.pool.query('DELETE FROM transactions WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  }

  async seed(records = []) {
    for (const r of records) {
      await this.pool.query(`
        INSERT INTO transactions (id, type, amount, date, party, category, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `, [r.id, r.type, r.amount, r.date, r.party, r.category, r.note || '']);
    }
  }

  async close() {
    if (this.pool) await this.pool.end();
  }
}

module.exports = PostgresAdapter;
