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
 *     summary: Apply for an errand
 *     description: Allows a verified runner to apply for a specific errand. Runners can either accept the current price or propose a new bid price.
 *     tags: [Runner Applications]
 *     security:
 *       - bearerAuth: []   # JWT required
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the errand the runner wants to apply for.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bidPrice:
 *                 type: number
 *                 example: 4500
 *                 description: Proposed price by the runner (optional). If not provided, the runner accepts the errand’s listed price.
 *     responses:
 *       200:
 *         description: Successfully applied for the errand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current price accepted for errand
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "8d0a3b12-cc0f-4e6a-992f-bb77f4e4732f"
 *                     runnerId:
 *                       type: string
 *                       format: uuid
 *                       example: "62d9c7f3-7a18-4e61-a8d5-8fef1f5e9340"
 *                     errandId:
 *                       type: string
 *                       format: uuid
 *                       example: "7b1f68b2-3c4e-45c6-beb8-9a1b24b71841"
 *                     currentPrice:
 *                       type: number
 *                       example: 5000
 *                     bidPrice:
 *                       type: number
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       example: Pending
 *       400:
 *         description: Bad request (invalid data or user not eligible)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Complete your KYC verification to apply for errands!
 *       401:
 *         description: Unauthorized (no token or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Errand not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand not found
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
