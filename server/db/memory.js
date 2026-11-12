class MemoryAdapter {
  constructor() {
    this.name = 'In-Memory Store';
    this.records = [];
  }

  async connect() {
    // In-memory ready
  }

  async healthCheck() {
    return true;
  }

  async getAll(filters = {}) {
    let result = [...this.records];

    if (filters.type && filters.type !== 'ALL') {
      result = result.filter(r => r.type === filters.type);
    }

    if (filters.category && filters.category !== 'ALL') {
      result = result.filter(r => r.category === filters.category);
    }

    if (filters.startDate) {
      result = result.filter(r => r.date >= filters.startDate);
    }

    if (filters.endDate) {
      result = result.filter(r => r.date <= filters.endDate);
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(r => 
        (r.party && r.party.toLowerCase().includes(s)) ||
        (r.note && r.note.toLowerCase().includes(s)) ||
        (r.category && r.category.toLowerCase().includes(s))
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    return this.records.find(r => r.id === id) || null;
  }

  async create(data) {
    const id = data.id || `tx-${Date.now()}`;
    const newTx = {
      id,
      type: data.type,
      amount: parseFloat(data.amount),
      date: data.date,
      party: data.party,
      category: data.category,
      note: data.note || ''
    };
    this.records.unshift(newTx);
    return newTx;
  }

  async update(id, data) {
    const idx = this.records.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.records[idx] = {
      ...this.records[idx],
      type: data.type,
      amount: parseFloat(data.amount),
      date: data.date,
      party: data.party,
      category: data.category,
      note: data.note || ''
    };
    return this.records[idx];
  }

  async delete(id) {
    const prevLen = this.records.length;
    this.records = this.records.filter(r => r.id !== id);
    return this.records.length < prevLen;
  }

  async seed(records = []) {
    for (const r of records) {
      if (!this.records.some(x => x.id === r.id)) {
        this.records.push({
          id: r.id,
          type: r.type,
          amount: parseFloat(r.amount),
          date: r.date,
          party: r.party,
          category: r.category,
          note: r.note || ''
        });
      }
    }
  }

  async close() {}
}

module.exports = MemoryAdapter;
