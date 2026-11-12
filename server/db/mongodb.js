const { MongoClient } = require('mongodb');

class MongoAdapter {
  constructor(config = {}) {
    this.name = 'MongoDB';
    this.connectionString = config.connectionString || process.env.DATABASE_URL || process.env.MONGODB_URI;
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    const uri = this.connectionString || 'mongodb://localhost:27017/openhisaab';
    const dbName = process.env.DB_NAME || 'openhisaab';

    this.client = new MongoClient(uri, {
      maxPoolSize: parseInt(process.env.DB_POOL_MAX || '10'),
      serverSelectionTimeoutMS: 5000
    });

    await this.client.connect();
    this.db = this.client.db(dbName);
    this.collection = this.db.collection('transactions');

    await this.initSchema();
  }

  async initSchema() {
    await this.collection.createIndex({ id: 1 }, { unique: true });
    await this.collection.createIndex({ date: -1 });
    await this.collection.createIndex({ type: 1 });
    await this.collection.createIndex({ category: 1 });
  }

  async healthCheck() {
    if (!this.db) return false;
    const res = await this.db.command({ ping: 1 });
    return res.ok === 1;
  }

  async getAll(filters = {}) {
    const query = {};

    if (filters.type && filters.type !== 'ALL') {
      query.type = filters.type;
    }

    if (filters.category && filters.category !== 'ALL') {
      query.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ party: regex }, { note: regex }, { category: regex }];
    }

    const docs = await this.collection.find(query).sort({ date: -1 }).toArray();
    return docs.map(d => ({
      id: d.id,
      type: d.type,
      amount: parseFloat(d.amount),
      date: d.date,
      party: d.party,
      category: d.category,
      note: d.note || ''
    }));
  }

  async getById(id) {
    const d = await this.collection.findOne({ id });
    if (!d) return null;
    return {
      id: d.id,
      type: d.type,
      amount: parseFloat(d.amount),
      date: d.date,
      party: d.party,
      category: d.category,
      note: d.note || ''
    };
  }

  async create(data) {
    const id = data.id || `tx-${Date.now()}`;
    const doc = {
      id,
      type: data.type,
      amount: parseFloat(data.amount),
      date: data.date,
      party: data.party,
      category: data.category,
      note: data.note || '',
      createdAt: new Date()
    };
    await this.collection.insertOne(doc);
    return this.getById(id);
  }

  async update(id, data) {
    const res = await this.collection.findOneAndUpdate(
      { id },
      {
        $set: {
          type: data.type,
          amount: parseFloat(data.amount),
          date: data.date,
          party: data.party,
          category: data.category,
          note: data.note || '',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    if (!res) return null;
    return this.getById(id);
  }

  async delete(id) {
    const res = await this.collection.deleteOne({ id });
    return res.deletedCount > 0;
  }

  async seed(records = []) {
    for (const r of records) {
      const existing = await this.collection.findOne({ id: r.id });
      if (!existing) {
        await this.collection.insertOne({
          id: r.id,
          type: r.type,
          amount: parseFloat(r.amount),
          date: r.date,
          party: r.party,
          category: r.category,
          note: r.note || '',
          createdAt: new Date()
        });
      }
    }
  }

  async close() {
    if (this.client) await this.client.close();
  }
}

module.exports = MongoAdapter;
