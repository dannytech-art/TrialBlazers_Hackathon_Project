const router = require('express').Router();
const {
  applyForErrand,
  getErrandApplications,
  updateApplicationStatus,
  getRunnerApplications,
  getErrandApplicationsForArunner,
  acceptRunnerApplication,
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

/**
 * @swagger
 * /api/v1/applicant/{errandId}/{runnerId}:
 *   get:
 *     summary: Get a specific runner's application for an errand
 *     tags: [Errand Applications]
 *     description: Retrieve all applications submitted by a specific runner (`runnerId`) for a specific errand (`errandId`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: The unique ID of the errand.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: runnerId
 *         required: true
 *         description: The unique ID of the runner.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully retrieved applications for the runner and errand.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Found 1 applications for this errand"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "8d5a36b2-fd8b-42e4-8e6c-8c39a9a38b4f"
 *                       errandId:
 *                         type: string
 *                         example: "e4dcb06d-0134-4d38-a9d0-6a5460bfa0f2"
 *                       runnerId:
 *                         type: string
 *                         example: "7e35e3f5-729c-4c70-a5b9-94c3a8b2c3de"
 *                       runner:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "7e35e3f5-729c-4c70-a5b9-94c3a8b2c3de"
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Doe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                           bio:
 *                             type: string
 *                             example: "Experienced runner available for delivery errands."
 *                           rating:
 *                             type: number
 *                             example: 4.5
 *                           totalJobs:
 *                             type: integer
 *                             example: 22
 *                 pickupContact:
 *                   type: string
 *                   example: "+2348081234567"
 *       400:
 *         description: Invalid parameters or missing errandId/runnerId.
 *       401:
 *         description: Unauthorized - invalid or missing authentication token.
 *       404:
 *         description: No applications found for the given errand and runner.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/applicant/:errandId/:runnerId', authenticated, getErrandApplicationsForArunner)

/**
 * @swagger
 * /api/v1/errands/{errandId}/applications/{applicationId}/accept:
 *   patch:
 *     summary: Accept a runner application for an errand
 *     description: Allows a client to accept a runner who applied for their errand. Other applications for the same errand are automatically rejected.
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: errandId
 *         in: path
 *         required: true
 *         description: The ID of the errand.
 *         schema:
 *           type: string
 *       - name: applicationId
 *         in: path
 *         required: true
 *         description: The ID of the runner’s application to accept.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Runner application accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Runner application accepted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     acceptedApplication:
 *                       $ref: '#/components/schemas/RunnerApplication'
 *                     errand:
 *                       $ref: '#/components/schemas/Errand'
 *       400:
 *         description: Invalid request or unauthorized action
 *       404:
 *         description: Errand or application not found
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/errands/:errandId/applications/:applicationId/accept', authenticated, acceptRunnerApplication);

module.exports = router;
