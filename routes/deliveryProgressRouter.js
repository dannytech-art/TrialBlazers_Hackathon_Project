const { progress } = require('../controllers/deliveryProgressController');
const { authenticated } = require('../middleware/authenticate');

const router = require('express').Router();

/**
 * @swagger
 * /api/v1/delivery-status/{errandId}:
 *   get:
 *     summary: Get delivery progress status for a specific errand
 *     description: >
 *       This endpoint returns the progress status of an errand for the authenticated runner.  
 *       It ensures only the assigned runner can view the progress status.
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique ID of the errand to check delivery progress for.
 *     responses:
 *       200:
 *         description: Progress status successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Progress updated successfully
 *                 progress:
 *                   type: integer
 *                   example: 1
 *                   description: >
 *                     Numeric progress indicator:
 *                     1 = Heading to pickup,
 *                     2 = Picked up,
 *                     3 = Delivering,
 *                     4 = Completed
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "a6a25f70-88dc-4b0a-b41d-123456789abc"
 *                     title:
 *                       type: string
 *                       example: "Deliver documents to office"
 *                     status:
 *                       type: string
 *                       example: "Assigned"
 *                     assignedTo:
 *                       type: string
 *                       example: "8c971b2e-34f1-4a1e-ae59-654321abcd09"
 *                     pickupAddress:
 *                       type: string
 *                       example: "24 Allen Avenue, Ikeja, Lagos"
 *                     deliveryAddress:
 *                       type: string
 *                       example: "Lekki Phase 1, Lagos"
 *       401:
 *         description: Unauthorized — user not logged in or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden — user is not assigned to this errand.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not assigned to this errand
 *       404:
 *         description: Errand not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Something went wrong while fetching progress."
 */


router.get('/delivery-status:errandId', authenticated, progress);

module.exports = router;