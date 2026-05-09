module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    message: 'Vercel app is running!',
    timestamp: new Date().toISOString(),
    env_check: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Not set',
      DB_SSL: process.env.DB_SSL || 'not set (defaults to SSL enabled)'
    }
  });
};
