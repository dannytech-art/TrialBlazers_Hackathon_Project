const express = require("express");
const { authenticated } = require("../middleware/authenticate");
const { updateProgress, getErrandProgresSummary } = require("../controllers/deliveryProgressController");

const router = express.Router();

/**
 * @swagger
 * /api/v1/errands/{errandId}/progress:
 *   put:
 *     summary: Update errand delivery progress
 *     tags: [Errands]
 *     description: Update the current delivery progress for an errand. Each step records a timestamp.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: UUID of the errand
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - step
 *             properties:
 *               step:
 *                 type: string
 *                 enum:
 *                   - orderAssigned
 *                   - headingToPickup
 *                   - arrivedAtPickup
 *                   - itemPicked
 *                   - headingToDelivery
 *                   - arrivedAtDelivery
 *                   - deliveredConfirmed
 *                 example: "arrivedAtPickup"
 *     responses:
 *       200:
 *         description: Progress step updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "arrivedAtPickup step marked as completed"
 *               timestamp: "2025-11-11T12:25:43.000Z"
 *               data:
 *                 id: "36a545af-1c2b-43f2-bd9b-b5a87cc118e4"
 *                 assignedTo: "d93dcd35-3a91-44a1-82a3-9e8f5321188c"
 *                 orderAssignedAt: null
 *                 headingToPickupAt: "2025-11-11T12:20:10.000Z"
 *                 arrivedAtPickupAt: "2025-11-11T12:25:43.000Z"
 *                 itemPickedAt: null
 *                 headingToDeliveryAt: null
 *                 arrivedAtDeliveryAt: null
 *                 deliveredConfirmedAt: null
 *                 status: "Assigned"
 *       400:
 *         description: Invalid or duplicate step update
 *         content:
 *           application/json:
 *             example:
 *               message: "This step is already completed"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not assigned to this errand"
 *       404:
 *         description: Errand not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Errand not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed to update progress"
 *               error: "Error message details"
 */
router.put("/:errandId/progress", authenticated, updateProgress);

/**
 * @swagger
 * /api/v1/errands/{errandId}/status:
 *   get:
 *     summary: Get errand delivery progress status
 *     tags: [Errands]
 *     description: Fetches the current delivery progress status for an errand.  
 *                  Returns only id, assignedTo, and all progress timestamps.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: UUID of the errand
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Progress status fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Progress status found"
 *               data:
 *                 id: "36a545af-1c2b-43f2-bd9b-b5a87cc118e4"
 *                 assignedTo: "d93dcd35-3a91-44a1-82a3-9e8f5321188c"
 *                 orderAssignedAt: "2025-11-11T12:05:22.000Z"
 *                 headingToPickupAt: "2025-11-11T12:10:11.000Z"
 *                 arrivedAtPickupAt: "2025-11-11T12:25:43.000Z"
 *                 itemPickedAt: null
 *                 headingToDeliveryAt: null
 *                 arrivedAtDeliveryAt: null
 *                 deliveredConfirmedAt: null
 *                 status: "Assigned"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: Errand not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Errand not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed to fetch status"
 *               error: "Error message details"
 */

router.get("/:errandId/status", authenticated, getErrandProgresSummary)

module.exports = router;
