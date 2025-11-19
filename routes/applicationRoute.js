const router = require('express').Router();
const {
  applyForErrand,
  getErrandApplications,
  updateApplicationStatus,
  getRunnerApplications,
  getErrandApplicationsForArunner,
  acceptRunnerApplication,
  rejectRunnerApplication,
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
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
 *     summary: Accept a runner's application for an errand
 *     description: Allows a **Client** to accept one of the runner applications for a specific errand. When accepted, the errand becomes **Assigned** and two OTP codes (Start OTP and Delivery OTP) are generated for secure pickup and delivery verification.
 *     tags:
 *       - Errands
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: errandId
 *         in: path
 *         required: true
 *         description: The ID of the errand to assign
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: applicationId
 *         in: path
 *         required: true
 *         description: The ID of the runner's application to accept
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Runner application accepted successfully and OTPs generated
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
 *                       type: object
 *                       description: The details of the accepted runner application
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 4b1fa5a8-9a5b-42cb-97b2-07ac7b1d4093
 *                         status:
 *                           type: string
 *                           example: Accepted
 *                         runnerId:
 *                           type: string
 *                           example: 0f90aef8-9e5f-41b7-9b0c-fdc438a9a22e
 *                         errandId:
 *                           type: string
 *                           example: 671edc29-3b64-44d9-a354-0a4a537a0df9
 *                     errand:
 *                       type: object
 *                       description: The updated errand assigned to the runner
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 671edc29-3b64-44d9-a354-0a4a537a0df9
 *                         title:
 *                           type: string
 *                           example: Deliver a food package to Lekki Phase 1
 *                         status:
 *                           type: string
 *                           example: Assigned
 *                         assignedTo:
 *                           type: string
 *                           example: 0f90aef8-9e5f-41b7-9b0c-fdc438a9a22e
 *                         startOTP:
 *                           type: string
 *                           example: "4821"
 *                         deliveryOTP:
 *                           type: string
 *                           example: "9634"
 *                         startOTPExpires:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         deliveryOTPExpires:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *       400:
 *         description: Invalid request (unauthorized or missing parameters)
 *         content:
 *           application/json:
 *             example:
 *               message: You are not authorized to accept applications for this errand
 *       404:
 *         description: Errand or application not found
 *         content:
 *           application/json:
 *             example:
 *               message: Application not found for this errand
 */
router.patch('/errands/:errandId/applications/:applicationId/accept', authenticated, acceptRunnerApplication);

/**
 * @swagger
 * /api/v1/errands/{errandId}/applications/{applicationId}/reject:
 *   patch:
 *     summary: Reject a runner's application for a specific errand
 *     description: Allows a **Client** to reject a specific runner's application for an errand they posted.
 *     tags:
 *       - Errands
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: errandId
 *         in: path
 *         required: true
 *         description: The unique ID of the errand
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: applicationId
 *         in: path
 *         required: true
 *         description: The unique ID of the runner's application to be rejected
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Runner application rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Runner application rejected successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     rejectedApplication:
 *                       type: object
 *                       description: The details of the rejected runner's application
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 0c21b8c2-421b-4cf3-9f9f-531dcb239c58
 *                         status:
 *                           type: string
 *                           example: Rejected
 *                         runnerId:
 *                           type: string
 *                           example: 892f4bcd-d8ab-4659-b6ed-74d18b3f4af0
 *                         errandId:
 *                           type: string
 *                           example: f0f9d7a0-324f-4788-a746-290e51e3a89f
 *                     errand:
 *                       type: object
 *                       description: The updated errand details
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: f0f9d7a0-324f-4788-a746-290e51e3a89f
 *                         title:
 *                           type: string
 *                           example: Deliver a package to Lagos Island
 *                         status:
 *                           type: string
 *                           example: Open
 *       400:
 *         description: Bad request (Invalid input or unauthorized user)
 *         content:
 *           application/json:
 *             example:
 *               message: You are not authorized to reject applications for this errand
 *       404:
 *         description: Errand or runner application not found
 *         content:
 *           application/json:
 *             example:
 *               message: Runner application not found for this errand
 */
router.patch('/errands/:errandId/applications/:applicationId/reject', authenticated, rejectRunnerApplication);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "b1f5876a-ef2e-4b03-9e85-76af12345678"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "52c43d11-32ba-4e55-a4a9-777123abcd88"
 *         type:
 *           type: string
 *           example: "runner_applied"
 *         message:
 *           type: string
 *           example: "A runner applied for your errand 'Pick up documents'."
 *         meta:
 *           type: object
 *           nullable: true
 *           example:
 *             errandId: "f9ad12cd-88bb-4c05-a91a-66789aaccc99"
 *             applicationId: "aa12bc34-dd56-ef78-90ab-cdef12345678"
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-16T09:22:46.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-16T09:22:46.000Z"
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Returns paginated notifications belonging to the logged-in user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number 
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Number of notifications per page
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized — JWT missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', authenticated, getNotifications);

/**
 * @swagger
 * /api/v1/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark a notification as read
 *     description: Marks a specific notification as read for the authenticated user.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         description: Notification ID to mark as read
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification marked as read"
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/notifications/:notificationId/read', authenticated, markNotificationAsRead);

/**
 * @swagger
 * /api/v1/notifications/readall:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications for the authenticated user as read.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.put('/notifications/readall', authenticated, markAllAsRead);

module.exports = router;
