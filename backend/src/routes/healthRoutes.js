/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Backend health check passed
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend health check passed',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
