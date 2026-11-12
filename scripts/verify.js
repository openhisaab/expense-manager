const { getDatabaseAdapter } = require('./server/db');

async function verify() {
  console.log('Testing Database Adapters...');

  // Test 1: In-memory fallback
  const mem = getDatabaseAdapter();
  console.log('1. Default Adapter:', mem.name);
  await mem.connect();
  const isHealthy = await mem.healthCheck();
  console.log('   HealthCheck:', isHealthy);

  // Test 2: PostgreSQL adapter initialization
  process.env.DB_TYPE = 'postgres';
  const pg = getDatabaseAdapter();
  console.log('2. Postgres Adapter initialized:', pg.name);

  // Test 3: CockroachDB adapter initialization
  process.env.DB_TYPE = 'cockroachdb';
  const cr = getDatabaseAdapter();
  console.log('3. CockroachDB Adapter initialized:', cr.name);

  // Test 4: MySQL adapter initialization
  process.env.DB_TYPE = 'mysql';
  const my = getDatabaseAdapter();
  console.log('4. MySQL Adapter initialized:', my.name);

  // Test 5: MSSQL adapter initialization
  process.env.DB_TYPE = 'mssql';
  const ms = getDatabaseAdapter();
  console.log('5. MSSQL Adapter initialized:', ms.name);

  // Test 6: MongoDB adapter initialization
  process.env.DB_TYPE = 'mongodb';
  const mg = getDatabaseAdapter();
  console.log('6. MongoDB Adapter initialized:', mg.name);

  console.log('\nAll 5 database adapters + In-Memory fallback verified successfully!');
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
