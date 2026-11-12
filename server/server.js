require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { getDatabaseAdapter } = require('./db');

const app = express();
const PORT = parseInt(process.env.PORT || '8080');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Adapter
const db = getDatabaseAdapter();

// Generic sample seed
const SAMPLE_SEED = [
  { id: "tx-1", type: "in", date: "2026-11-06T14:53", party: "Salary / Monthly Inflow", category: "Income / Salary", note: "Monthly Cash Inflow", amount: 234078.00 },
  { id: "tx-2", type: "out", date: "2026-11-06T18:10", party: "ATM / Cash Withdrawal", category: "Cash Withdrawal", note: "Cash for monthly spending", amount: 30000.00 },
  { id: "tx-3", type: "out", date: "2026-11-06T18:14", party: "Pharmacy & Clinic", category: "Healthcare & Medical", note: "Prescriptions & Medical", amount: 3700.00 },
  { id: "tx-4", type: "out", date: "2026-11-06T18:22", party: "Meat & Poultry Vendor", category: "Food & Groceries", note: "Fresh meat & chicken", amount: 1150.00 },
  { id: "tx-5", type: "out", date: "2026-11-06T18:32", party: "Supermarket & Wholesale", category: "Food & Groceries", note: "Monthly pantry grocery", amount: 20000.00 },
  { id: "tx-6", type: "out", date: "2026-11-06T18:46", party: "Water Supply Service", category: "Utilities & Bills", note: "Water delivery & supply", amount: 1430.00 },
  { id: "tx-7", type: "out", date: "2026-11-06T18:47", party: "Broadband Internet Provider", category: "Mobile & Internet", note: "Fiber internet bill", amount: 2000.00 },
  { id: "tx-8", type: "out", date: "2026-11-06T18:48", party: "Personal Loan Repayment", category: "Credit Card & Loans", note: "Monthly loan installment", amount: 10000.00 },
  { id: "tx-9", type: "out", date: "2026-11-06T18:49", party: "Property Owner / Landlord", category: "Housing & Rent", note: "Apartment / House Rent", amount: 40000.00 },
  { id: "tx-10", type: "out", date: "2026-11-06T18:50", party: "Community Savings Committee A", category: "Savings & Committee", note: "Monthly ballot contribution", amount: 12500.00 },
  { id: "tx-11", type: "out", date: "2026-11-06T18:50", party: "Community Savings Committee B", category: "Savings & Committee", note: "Monthly ballot contribution", amount: 4000.00 },
  { id: "tx-12", type: "out", date: "2026-11-06T18:55", party: "Supermarket & Wholesale", category: "Food & Groceries", note: "Fresh produce & essentials", amount: 8000.00 },
  { id: "tx-13", type: "out", date: "2026-11-06T19:17", party: "Gas Utility Company", category: "Utilities & Bills", note: "Natural gas utility bill", amount: 2010.00 },
  { id: "tx-14", type: "out", date: "2026-11-06T19:17", party: "Electric Power Utility", category: "Utilities & Bills", note: "Electricity bill", amount: 5782.00 },
  { id: "tx-15", type: "out", date: "2026-11-07T03:23", party: "Café & Breakfast", category: "Dining & Outing", note: "Breakfast outing", amount: 300.00 },
  { id: "tx-16", type: "out", date: "2026-11-07T04:59", party: "Ride Hailing Service", category: "Transportation & Fuel", note: "Morning commute fare", amount: 362.00 },
  { id: "tx-17", type: "out", date: "2026-11-07T16:55", party: "Home Cash Reserve", category: "Cash Withdrawal", note: "Cash for daily home needs", amount: 20000.00 },
  { id: "tx-18", type: "out", date: "2026-11-07T19:29", party: "Pharmacy & Clinic", category: "Healthcare & Medical", note: "Emergency medication", amount: 220.00 },
  { id: "tx-19", type: "out", date: "2026-11-08T00:11", party: "Intercity Transit / Fuel", category: "Transportation & Fuel", note: "Travel and fuel refill", amount: 1800.00 },
  { id: "tx-20", type: "out", date: "2026-11-08T20:26", party: "Miscellaneous Expense A", category: "Miscellaneous", note: "General household expense", amount: 2000.00 },
  { id: "tx-21", type: "out", date: "2026-11-08T23:39", party: "Miscellaneous Expense B", category: "Miscellaneous", note: "General store purchase", amount: 1000.00 },
  { id: "tx-22", type: "out", date: "2026-11-09T18:18", party: "Neighborhood Grocery", category: "Food & Groceries", note: "Daily milk & dairy", amount: 160.00 },
  { id: "tx-23", type: "out", date: "2026-11-09T20:29", party: "Mobile Network Operator 1", category: "Mobile & Internet", note: "Monthly mobile call & data bundle", amount: 750.00 },
  { id: "tx-24", type: "out", date: "2026-11-09T20:31", party: "Mobile Network Operator 2", category: "Mobile & Internet", note: "Secondary mobile package", amount: 458.00 },
  { id: "tx-25", type: "out", date: "2026-11-09T21:22", party: "Neighborhood Grocery", category: "Food & Groceries", note: "Bakery & bread", amount: 150.00 },
  { id: "tx-26", type: "out", date: "2026-11-09T22:29", party: "Credit Card Bank", category: "Credit Card & Loans", note: "Monthly card bill & installment", amount: 45000.00 },
  { id: "tx-27", type: "out", date: "2026-11-09T23:58", party: "Neighborhood Grocery", category: "Food & Groceries", note: "Snacks & water", amount: 90.00 },
  { id: "tx-28", type: "out", date: "2026-11-10T04:32", party: "City Taxi / Transit", category: "Transportation & Fuel", note: "Early morning transit fare", amount: 190.00 },
  { id: "tx-29", type: "out", date: "2026-11-10T20:23", party: "Cloud & Developer Software", category: "Cloud & Software", note: "Software tool subscription", amount: 6300.00 },
  { id: "tx-30", type: "out", date: "2026-11-11T20:08", party: "Local Rickshaw / Transit", category: "Transportation & Fuel", note: "Evening return commute", amount: 280.00 }
];

// ----------------------------------------------------
// Kubernetes Health & Readiness Probes
// ----------------------------------------------------

// Liveness Probe
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Readiness Probe (verifies database connectivity)
app.get('/readyz', async (req, res) => {
  try {
    const isReady = await db.healthCheck();
    if (isReady) {
      res.status(200).json({ status: 'READY', provider: db.name });
    } else {
      res.status(503).json({ status: 'NOT_READY', error: 'Database health check failed' });
    }
  } catch (err) {
    res.status(503).json({ status: 'NOT_READY', error: err.message });
  }
});

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// System info
app.get('/api/info', async (req, res) => {
  res.json({
    app: 'OpenHisaab',
    version: '1.0.0',
    databaseProvider: db.name,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// List transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;
    const transactions = await db.getAll({ type, category, startDate, endDate, search });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single transaction
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const tx = await db.getById(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { type, amount, date, party, category, note } = req.body;
    if (!type || !amount || !date || !party) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }
    const created = await db.create({ type, amount, date, party, category, note });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { type, amount, date, party, category, note } = req.body;
    const updated = await db.update(req.params.id, { type, amount, date, party, category, note });
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deleted = await db.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed sample data
app.post('/api/seed', async (req, res) => {
  try {
    await db.seed(SAMPLE_SEED);
    res.json({ success: true, count: SAMPLE_SEED.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summary calculations
app.get('/api/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transactions = await db.getAll({ startDate, endDate });

    let totalIn = 0;
    let totalOut = 0;
    const categoryTotals = {};

    transactions.forEach(t => {
      const amt = Number(t.amount || 0);
      if (t.type === 'in') {
        totalIn += amt;
      } else {
        totalOut += amt;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      }
    });

    res.json({
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      count: transactions.length,
      categoryTotals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static assets from root
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ----------------------------------------------------
// Server Lifecycle & Graceful Shutdown
// ----------------------------------------------------
let server;

async function start() {
  try {
    console.log(`Connecting to database provider: ${db.name}...`);
    await db.connect();
    console.log(`Connected successfully to ${db.name}.`);

    // Auto-seed if empty
    const existing = await db.getAll();
    if (existing.length === 0) {
      console.log('Seeding initial sample statement data...');
      await db.seed(SAMPLE_SEED);
    }

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`OpenHisaab Server running on http://0.0.0.0:${PORT}`);
      console.log(`Liveness probe:  http://localhost:${PORT}/healthz`);
      console.log(`Readiness probe: http://localhost:${PORT}/readyz`);
      console.log(`API info:        http://localhost:${PORT}/api/info`);
    });
  } catch (err) {
    console.error('Failed to start OpenHisaab server:', err);
    process.exit(1);
  }
}

// Graceful termination for Kubernetes SIGTERM / SIGINT
async function shutdown(signal) {
  console.log(`Received ${signal}. Gracefully stopping server...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await db.close();
        console.log('Database connections closed.');
      } catch (e) {
        console.error('Error closing DB connections:', e);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
