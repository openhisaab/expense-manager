const PostgresAdapter = require('./postgres');
const MySQLAdapter = require('./mysql');
const MSSQLAdapter = require('./mssql');
const MongoAdapter = require('./mongodb');
const MemoryAdapter = require('./memory');

function getDatabaseAdapter() {
  const dbType = (process.env.DB_TYPE || '').toLowerCase().trim();
  const dbUrl = (process.env.DATABASE_URL || process.env.MONGODB_URI || '').toLowerCase();

  // Explicit type matching
  if (dbType === 'postgres' || dbType === 'postgresql') {
    return new PostgresAdapter();
  }
  if (dbType === 'cockroach' || dbType === 'cockroachdb') {
    return new PostgresAdapter({ isCockroach: true });
  }
  if (dbType === 'mysql' || dbType === 'mariadb') {
    return new MySQLAdapter();
  }
  if (dbType === 'mssql' || dbType === 'sqlserver') {
    return new MSSQLAdapter();
  }
  if (dbType === 'mongo' || dbType === 'mongodb') {
    return new MongoAdapter();
  }

  // URL-based auto-detection
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    if (dbUrl.includes('cockroach') || process.env.DB_PORT === '26257') {
      return new PostgresAdapter({ isCockroach: true });
    }
    return new PostgresAdapter();
  }
  if (dbUrl.startsWith('mysql://')) {
    return new MySQLAdapter();
  }
  if (dbUrl.startsWith('mssql://') || dbUrl.startsWith('sqlserver://')) {
    return new MSSQLAdapter();
  }
  if (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://')) {
    return new MongoAdapter();
  }

  // Fallback to in-memory store
  return new MemoryAdapter();
}

module.exports = {
  getDatabaseAdapter
};
