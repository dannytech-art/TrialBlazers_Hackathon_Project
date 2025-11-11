const router = require('express').Router();
const { getClientDashboard } = require('../controllers/dashboardController');
const { authenticated } = require('../middleware/authenticate');

/**
 * @swagger
 * /client-summary:
 *   get:
 *     summary: Fetch client dashboard summary
 *     description: Returns the client's dashboard data including total requests, completed errands, active errands, and total amount spent.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched client dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client dashboard data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: integer
 *                       example: 15
 *                       description: Total errands created by the client
 *                     completedJobs:
 *                       type: integer
 *                       example: 7
 *                       description: Number of errands completed
 *                     activeJobs:
 *                       type: integer
 *                       example: 3
 *                       description: Number of errands currently active
 *                     totalSpent:
 *                       type: number
 *                       format: float
 *                       example: 350.50
 *                       description: Total amount spent by the client
 *       401:
 *         description: Unauthorized — Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 */
router.get('/client-summary', authenticated, getClientDashboard);

module.exports = router;