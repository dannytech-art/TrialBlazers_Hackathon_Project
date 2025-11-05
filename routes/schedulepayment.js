/**
 * @swagger
 * tags:
 *   name: Scheduled Payments
 *   description: To manage scheduled  payments using KoraPay
 */

const express = require('express');
const router = express.Router();
const { processMondayPayments } = require('../controllers/paymentSchedule');
const { authenticated, isAdmin } = require('../middleware/authenticate'); 

/**
 * @swagger
 * /api/v1/payments/schedule:
 *   post:
 *     summary: Trigger scheduled Monday payments manually
 *     description: |
 *       This endpoint allows an **admin** to manually trigger the Monday payment scheduler.
 *       It processes all payments with a "Pending" status and sends them through the KoraPay API.
 *       The same process runs automatically every Monday at 8:00 AM via the cron job.
 *     tags: [Scheduled Payments]
 *     security:
 *       - bearerAuth: []   # Uses JWT Authentication
 *     responses:
 *       200:
 *         description: Payments processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Monday payments processed successfully.
 *                 processedPayments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: c1b2f7b2-3a21-4b90-9d89-abcdef123456
 *                       amount:
 *                         type: number
 *                         example: 2500.00
 *                       status:
 *                         type: string
 *                         example: Paid
 *                       message:
 *                         type: string
 *                         example: Payment processed successfully
 *       404:
 *         description: No pending payments found
 *       500:
 *         description: Internal server error
 */
router.post('/schedule', authenticated, isAdmin, processMondayPayments);

module.exports = router;
