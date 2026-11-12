const mssql = require('mssql');

class MSSQLAdapter {
  constructor(config = {}) {
    this.name = 'Microsoft SQL Server (MSSQL)';
    this.connectionString = config.connectionString || process.env.DATABASE_URL;
    this.pool = null;
  }

  async connect() {
    const config = this.connectionString
      ? this.connectionString
      : {
          server: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '1433'),
          user: process.env.DB_USER || 'sa',
          password: process.env.DB_PASSWORD || 'Password123!',
          database: process.env.DB_NAME || 'openhisaab',
          options: {
            encrypt: process.env.DB_SSL === 'true',
            trustServerCertificate: true
          },
          pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10'),
            min: 0,
            idleTimeoutMillis: 30000
          }
        };

    this.pool = await mssql.connect(config);
    await this.initSchema();
  }

  async initSchema() {
    const req = this.pool.request();
    await req.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='transactions' and xtype='U')
      BEGIN
        CREATE TABLE transactions (
          id NVARCHAR(64) PRIMARY KEY,
          type NVARCHAR(16) NOT NULL,
          amount DECIMAL(14, 2) NOT NULL,
          date DATETIMEOFFSET NOT NULL,
          party NVARCHAR(255) NOT NULL,
          category NVARCHAR(128) NOT NULL,
          note NVARCHAR(MAX),
          created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
        );
        CREATE INDEX idx_tx_date ON transactions(date);
        CREATE INDEX idx_tx_type ON transactions(type);
        CREATE INDEX idx_tx_category ON transactions(category);
      END
    `);
  }

  async healthCheck() {
    if (!this.pool) return false;
    const req = this.pool.request();
    const res = await req.query('SELECT 1 AS alive');
    return res.recordset.length > 0;
  }

  async getAll(filters = {}) {
    const req = this.pool.request();
    let query = 'SELECT * FROM transactions WHERE 1=1';

    if (filters.type && filters.type !== 'ALL') {
      req.input('type', mssql.NVarChar, filters.type);
      query += ' AND type = @type';
    }

    if (filters.category && filters.category !== 'ALL') {
      req.input('category', mssql.NVarChar, filters.category);
      query += ' AND category = @category';
    }

    if (filters.startDate) {
      req.input('startDate', mssql.DateTimeOffset, new Date(filters.startDate));
      query += ' AND date >= @startDate';
    }

    if (filters.endDate) {
      req.input('endDate', mssql.DateTimeOffset, new Date(filters.endDate));
      query += ' AND date <= @endDate';
    }

    if (filters.search) {
      req.input('search', mssql.NVarChar, `%${filters.search}%`);
      query += ' AND (party LIKE @search OR note LIKE @search OR category LIKE @search)';
    }

    query += ' ORDER BY date DESC';
    const res = await req.query(query);
    return res.recordset.map(r => ({
      ...r,
      amount: parseFloat(r.amount),
      date: new Date(r.date).toISOString().slice(0, 16)
    }));
  }

  async getById(id) {
    const req = this.pool.request();
    req.input('id', mssql.NVarChar, id);
    const res = await req.query('SELECT * FROM transactions WHERE id = @id');
    if (res.recordset.length === 0) return null;
    const r = res.recordset[0];
    return { ...r, amount: parseFloat(r.amount), date: new Date(r.date).toISOString().slice(0, 16) };
  }

  async create(data) {
    const id = data.id || `tx-${Date.now()}`;
    const req = this.pool.request();
    req.input('id', mssql.NVarChar, id);
    req.input('type', mssql.NVarChar, data.type);
    req.input('amount', mssql.Decimal(14, 2), data.amount);
    req.input('date', mssql.DateTimeOffset, new Date(data.date));
    req.input('party', mssql.NVarChar, data.party);
    req.input('category', mssql.NVarChar, data.category);
    req.input('note', mssql.NVarChar, data.note || '');

    await req.query(`
      INSERT INTO transactions (id, type, amount, date, party, category, note)
      VALUES (@id, @type, @amount, @date, @party, @category, @note);
    `);
    return this.getById(id);
  }

  async update(id, data) {
    const req = this.pool.request();
    req.input('id', mssql.NVarChar, id);
    req.input('type', mssql.NVarChar, data.type);
    req.input('amount', mssql.Decimal(14, 2), data.amount);
    req.input('date', mssql.DateTimeOffset, new Date(data.date));
    req.input('party', mssql.NVarChar, data.party);
    req.input('category', mssql.NVarChar, data.category);
    req.input('note', mssql.NVarChar, data.note || '');

    const res = await req.query(`
      UPDATE transactions
      SET type = @type, amount = @amount, date = @date, party = @party, category = @category, note = @note
      WHERE id = @id;
    `);
    if (res.rowsAffected[0] === 0) return null;
    return this.getById(id);
  }

  async delete(id) {
    const req = this.pool.request();
    req.input('id', mssql.NVarChar, id);
    const res = await req.query('DELETE FROM transactions WHERE id = @id');
    return res.rowsAffected[0] > 0;
  }

  async seed(records = []) {
    for (const r of records) {
      const existing = await this.getById(r.id);
      if (!existing) {
        await this.create(r);
      }
    }
  }

  async close() {
    if (this.pool) await this.pool.close();
  }
}

module.exports = MSSQLAdapter;
