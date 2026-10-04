const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initNeonDatabase() {
  console.log('🔄 Connecting to Neon PostgreSQL...');

  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in api/.env!');
    console.error('💡 Please add your Neon connection string in api/.env:');
    console.error('   DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require\n');
    process.exit(1);
  }

  // Strip channel_binding if present (node-postgres pure JS does not support channel binding)
  connectionString = connectionString.replace(/([?&])channel_binding=[^&]*(&|$)/, (m, p1, p2) => (p2 === '&' ? p1 : ''));

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to Neon successfully!');

    // Read schema.pg.sql
    const schemaPath = path.join(__dirname, 'schema.pg.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Executing schema & creating tables...');
    await client.query(schemaSql);
    console.log('✅ Schema migration applied successfully!');

    // Check created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n📋 Current Tables in Neon (${res.rows.length} total):`);
    res.rows.forEach(r => {
      console.log(`   • ${r.table_name}`);
    });

    // Check admin
    const adminCheck = await client.query('SELECT email, role FROM admins LIMIT 5');
    console.log(`\n👤 Admins (${adminCheck.rows.length}):`, adminCheck.rows.map(a => `${a.email} (${a.role})`).join(', '));

    // Check medicines
    const medCheck = await client.query('SELECT count(*) as count FROM medicines');
    console.log(`💊 Medicines in database: ${medCheck.rows[0].count}`);

    console.log('\n🎉 Neon PostgreSQL Database Setup is Complete!\n');
  } catch (err) {
    console.error('❌ Neon setup failed:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

initNeonDatabase();
