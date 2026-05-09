const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    // ── ADD a new 
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'name and email are required' });
      }

      const result = await pool.query(
        'INSERT INTO app_users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, 'default_pass', 'user']
      );

      res.status(201).json({
        message: '✅ User added!',
        user: result.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  } else if (req.method === 'GET') {
    // ── GET all users ──
    try {
      const result = await pool.query('SELECT * FROM app_users ORDER BY id');
      res.status(200).json({
        total: result.rows.length,
        users: result.rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  } else {
    res.status(405).json({ error: 'Use GET or POST' });
  }
};
