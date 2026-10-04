const { Pool } = require('pg');
require('dotenv').config();

// Determine connection config: prioritize DATABASE_URL (standard for Neon)
let poolConfig;

let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  dbUrl = dbUrl.replace(/([?&])channel_binding=[^&]*(&|$)/, (m, p1, p2) => (p2 === '&' ? p1 : ''));
}

if (dbUrl) {
  poolConfig = {
    connectionString: dbUrl,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'neondb',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pgPool = new Pool(poolConfig);

/**
 * Proxy wrapper for row objects to allow case-insensitive column access
 * and handle Postgres stringified counts/numbers (e.g. row.totalUsers)
 */
function wrapRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
  const lookup = {};
  for (const key of Object.keys(row)) {
    lookup[key.toLowerCase()] = row[key];
  }

  return new Proxy(row, {
    get(target, prop) {
      if (typeof prop !== 'string') return target[prop];
      if (prop in target) return target[prop];

      const lower = prop.toLowerCase();
      if (lower in lookup) {
        const val = lookup[lower];
        // Convert Postgres bigint / count strings to numbers when accessed with common count aliases
        if (
          typeof val === 'string' &&
          /^-?\d+$/.test(val) &&
          (prop.toLowerCase().includes('total') ||
            prop.toLowerCase().includes('count') ||
            prop.toLowerCase().includes('taken') ||
            prop.toLowerCase().includes('doses') ||
            prop.toLowerCase().includes('newusers'))
        ) {
          return parseInt(val, 10);
        }
        return val;
      }
      return target[prop];
    },
    has(target, prop) {
      if (typeof prop !== 'string') return prop in target;
      return prop in target || prop.toLowerCase() in lookup;
    },
  });
}

/**
 * Convert MySQL SQL syntax to PostgreSQL / Neon syntax
 */
function translateSql(sql) {
  let transformed = sql;

  // Ignore foreign key check statements
  if (/SET\s+FOREIGN_KEY_CHECKS/i.test(transformed)) {
    return { sql: 'SELECT 1', isNoop: true };
  }

  // Handle TRUNCATE TABLE ...
  transformed = transformed.replace(/TRUNCATE\s+TABLE\s+([a-zA-Z0-9_]+)/gi, 'TRUNCATE TABLE $1 CASCADE');

  // Handle CURDATE() -> CURRENT_DATE
  transformed = transformed.replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE');

  // Handle DATE_SUB(NOW(), INTERVAL ? DAY) or DATE_SUB(NOW(), INTERVAL 7 DAY)
  transformed = transformed.replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s*\?\s*DAY\s*\)/gi, "(NOW() - (? * INTERVAL '1 day'))");
  transformed = transformed.replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s*(\d+)\s*DAY\s*\)/gi, "(NOW() - INTERVAL '$1 days')");

  // Handle JSON functions if any remain
  transformed = transformed.replace(/\bJSON_ARRAYAGG\b/gi, 'json_agg');
  transformed = transformed.replace(/\bJSON_OBJECT\b/gi, 'json_build_object');

  // Handle ON DUPLICATE KEY UPDATE for medicines
  if (/INSERT\s+INTO\s+medicines/i.test(transformed) && /ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(transformed)) {
    transformed = transformed.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i,
      `ON CONFLICT (brand_name, strength, dosage_form, manufacturer) DO UPDATE SET
        unit_price = EXCLUDED.unit_price,
        indications = EXCLUDED.indications,
        indications_bn = EXCLUDED.indications_bn,
        composition = EXCLUDED.composition,
        composition_bn = EXCLUDED.composition_bn,
        instructions = EXCLUDED.instructions,
        side_effects = EXCLUDED.side_effects`
    );
  }

  // Handle ON DUPLICATE KEY UPDATE for users
  if (/INSERT\s+INTO\s+users/i.test(transformed) && /ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(transformed)) {
    transformed = transformed.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i,
      `ON CONFLICT (phone) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        is_active = 1`
    );
  }

  // Handle ON DUPLICATE KEY UPDATE for admins
  if (/INSERT\s+INTO\s+admins/i.test(transformed) && /ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(transformed)) {
    transformed = transformed.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i,
      'ON CONFLICT (email) DO NOTHING'
    );
  }

  // Replace VALUES(col) with EXCLUDED.col for any other duplicate updates
  transformed = transformed.replace(/VALUES\s*\(\s*([a-zA-Z0-9_]+)\s*\)/gi, 'EXCLUDED.$1');

  // Automatically append RETURNING id for INSERT queries if not already present
  const trimmed = transformed.trim();
  const isInsert = /^INSERT\s+INTO/i.test(trimmed);
  if (isInsert && !/RETURNING/i.test(trimmed)) {
    // Strip trailing semicolon if present
    if (trimmed.endsWith(';')) {
      transformed = trimmed.slice(0, -1) + ' RETURNING id;';
    } else {
      transformed = trimmed + ' RETURNING id';
    }
  }

  // Convert ? placeholders to $1, $2, ...
  let inSingle = false;
  let inDouble = false;
  let paramIndex = 1;
  let result = '';

  for (let i = 0; i < transformed.length; i++) {
    const char = transformed[i];
    const prevChar = i > 0 ? transformed[i - 1] : '';

    if (char === "'" && prevChar !== '\\') {
      inSingle = !inSingle;
      result += char;
    } else if (char === '"' && prevChar !== '\\') {
      inDouble = !inDouble;
      result += char;
    } else if (char === '?' && !inSingle && !inDouble) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }

  return { sql: result, isNoop: false };
}

/**
 * Execute query on pg client or pool, returning [rows/result, fields]
 */
async function executeQuery(executor, sql, params = []) {
  const { sql: finalSql, isNoop } = translateSql(sql);

  if (isNoop) {
    const emptyResult = [];
    emptyResult.insertId = null;
    emptyResult.affectedRows = 0;
    return [emptyResult, []];
  }

  const flatParams = Array.isArray(params) ? params : [];
  const res = await executor.query(finalSql, flatParams);

  const wrappedRows = (res.rows || []).map(wrapRow);

  // Attach metadata to emulate mysql2 return structure
  wrappedRows.insertId = res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : null;
  wrappedRows.affectedRows = res.rowCount || 0;
  wrappedRows.changedRows = res.rowCount || 0;
  wrappedRows.rowCount = res.rowCount || 0;

  return [wrappedRows, res.fields || []];
}

const pool = {
  execute: (sql, params) => executeQuery(pgPool, sql, params),
  query: (sql, params) => executeQuery(pgPool, sql, params),
  getConnection: async () => {
    const client = await pgPool.connect();
    return {
      execute: (sql, params) => executeQuery(client, sql, params),
      query: (sql, params) => executeQuery(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release(),
    };
  },
  end: () => pgPool.end(),
};

// Test connection on startup
async function testConnection() {
  try {
    const res = await pgPool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log(`✅ Neon PostgreSQL connected successfully! (DB: ${res.rows[0].db_name})`);
  } catch (error) {
    console.warn('⚠️ Neon PostgreSQL connection warning:', error.message);
    console.warn('💡 Make sure DATABASE_URL is set in api/.env with your Neon connection string.');
  }
}

module.exports = { pool, testConnection, pgPool };
