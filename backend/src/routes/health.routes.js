const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Liveness check (server + DB connection status)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is up and DB is connected
 *       503:
 *         description: DB is disconnected
 */
router.get('/', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    data: {
      server: 'up',
      database: dbConnected ? 'connected' : 'disconnected',
    },
    message: dbConnected ? 'Healthy' : 'Database not connected',
  });
});

module.exports = router;
