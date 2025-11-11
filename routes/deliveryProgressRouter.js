const express = require("express");
const { authenticated } = require("../middleware/authenticate");
const { updateProgress } = require("../controllers/deliveryProgressController");

const router = express.Router();

/**
 * @swagger
 * /api/v1/errands/{errandId}/progress:
 *   put:
 *     summary: Update errand delivery progress
 *     tags: [Errands]
 *     description: 
 *       Allows an assigned runner to update the current delivery progress of an errand.
 *       Each step (e.g., headingToPickup, arrivedAtPickup) records a timestamp when completed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: UUID of the errand to update
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
 *                 title: "Deliver package to Lekki"
 *                 status: "Assigned"
 *                 assignedTo: "d93dcd35-3a91-44a1-82a3-9e8f5321188c"
 *                 pickupAddress: "123 Allen Avenue, Ikeja"
 *                 deliveryAddress: "Lekki Phase 1, Lagos"
 *                 headingToPickupAt: "2025-11-11T12:25:43.000Z"
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
 *         description: Forbidden (user not assigned to this errand)
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed to update progress"
 *               error: "Error message details"
 */

router.put("/:errandId/progress", authenticated, updateProgress);

module.exports = router;
