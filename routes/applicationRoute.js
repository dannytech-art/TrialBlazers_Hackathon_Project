const router = require('express').Router();
const {
  applyForErrand,
  getErrandApplications,
  updateApplicationStatus,
  getRunnerApplications,
} = require('../controllers/applicationController');
const { authenticated } = require('../middleware/authenticate');

/**
 * @swagger
 * /api/v1/apply/{errandId}:
 *   post:
 *     summary: Runner applies for an errand
 *     description: Allows a verified runner to apply for a specific errand by providing a bid price and message.
 *     tags: [Runner Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the errand the runner wants to apply for.
 *         example: "2c1a2d0e-4410-4e23-8c60-d6b7e21e2f31"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidPrice
 *               - message
 *             properties:
 *               bidPrice:
 *                 type: number
 *                 format: float
 *                 description: The amount the runner is bidding for the errand.
 *                 example: 1500
 *               message:
 *                 type: string
 *                 description: A short note or message to the client explaining the offer or motivation.
 *                 example: "I live nearby and can get this done within 2 hours."
 *     responses:
 *       201:
 *         description: Application successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "32c9f480-16e1-41c4-a24b-42b7312f7469"
 *                     runnerId:
 *                       type: string
 *                       format: uuid
 *                       example: "b47e8610-3e64-4b28-9cf3-cd7e3b2a8472"
 *                     errandId:
 *                       type: string
 *                       format: uuid
 *                       example: "2c1a2d0e-4410-4e23-8c60-d6b7e21e2f31"
 *                     bidPrice:
 *                       type: number
 *                       example: 1500
 *                     message:
 *                       type: string
 *                       example: "I live nearby and can get this done within 2 hours."
 *                     status:
 *                       type: string
 *                       example: Pending
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-24T11:20:00.000Z"
 *       400:
 *         description: Bad Request — missing fields or duplicate application.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You have already applied for this errand
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
 */
router.post('/apply/:errandId', authenticated, applyForErrand);

/**
 * @swagger
 * /api/v1/errand/{errandId}:
 *   get:
 *     summary: Get all applications for a specific errand
 *     description: Fetch all runner applications submitted for a particular errand, including the runners’ basic details.
 *     tags: [Runner Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the errand
 *         example: "2c1a2d0e-4410-4e23-8c60-d6b7e21e2f31"
 *     responses:
 *       200:
 *         description: A list of all applications for the given errand.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Found 3 applications for this errand"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       runnerId:
 *                         type: string
 *                         format: uuid
 *                       errandId:
 *                         type: string
 *                         format: uuid
 *                       bidPrice:
 *                         type: number
 *                       message:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       runner:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             example: "James"
 *                           lastName:
 *                             type: string
 *                             example: "Olu"
 *                           email:
 *                             type: string
 *                             example: "jamesolu@gmail.com"
 *       404:
 *         description: Errand not found or no applications submitted.
 */
router.get('/errand/:errandId', authenticated, getErrandApplications);

/**
 * @swagger
 * /api/v1/{id}/status:
 *   put:
 *     summary: Update the status of a runner’s errand application
 *     description: Allows the errand creator (or admin) to accept or reject a runner’s application.
 *     tags: [Runner Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the application to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected]
 *                 example: "Accepted"
 *     responses:
 *       200:
 *         description: Application status updated successfully.
 *       400:
 *         description: Invalid status or bad request.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id/status', authenticated, updateApplicationStatus);

/**
 * @swagger
 * /api/v1/my-applications:
 *   get:
 *     summary: Get all errands applied for by the authenticated runner
 *     description: Returns a list of all errand applications submitted by the currently logged-in runner.
 *     tags: [Runner Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fetched runner applications successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       runnerId:
 *                         type: string
 *                       errandId:
 *                         type: string
 *                       bidPrice:
 *                         type: number
 *                       message:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       errand:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                             example: "Deliver package to Lagos Island"
 *                           description:
 *                             type: string
 *                             example: "Pick up parcel from Ikeja and deliver to Lagos Island."
 *                           budget:
 *                             type: number
 *                             example: 10000
 *                           location:
 *                             type: string
 *                             example: "Ikeja, Lagos"
 *       401:
 *         description: Unauthorized - missing or invalid token.
 */
router.get('/my-applications', authenticated, getRunnerApplications);

module.exports = router;
