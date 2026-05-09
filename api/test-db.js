const { Pool } = require('pg');

// This uses the DATABASE_URL environment variable set in Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const results = {
    timestamp: new Date().toISOString(),
    connection: null,
    serverInfo: null,
    tables: null,
    sampleData: null,
    errors: []
  };

  try {
    // Step 1: Test basic connection
    const client = await pool.connect();
    results.connection = '✅ Connected to PostgreSQL successfully!';

    // Step 2: Get server info
    const versionResult = await client.query('SELECT version()');
    results.serverInfo = versionResult.rows[0].version;

    // Step 3: List all tables
    const tablesResult = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    results.tables = tablesResult.rows;

    // Step 4: Get sample data from each table (first 5 rows)
    results.sampleData = {};
    for (const table of tablesResult.rows) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as total FROM "${table.table_name}"`);
        const dataResult = await client.query(`SELECT * FROM "${table.table_name}" LIMIT 5`);
        results.sampleData[table.table_name] = {
          totalRows: parseInt(countResult.rows[0].total),
          sampleRows: dataResult.rows,
          columns: dataResult.fields.map(f => f.name)
        };
      } catch (tableErr) {
        results.sampleData[table.table_name] = { error: tableErr.message };
      }
    }

    client.release();
  } catch (err) {
    results.connection = '❌ Connection FAILED';
    results.errors.push(err.message);
  }

  res.status(200).json(results);
};
