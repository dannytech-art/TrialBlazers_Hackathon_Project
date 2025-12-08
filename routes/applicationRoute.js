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
 *     summary: Apply for an errand (Runner only)
 *     description: >
 *       Allows a verified Runner to apply for an errand either by accepting the listed price  
 *       or proposing a custom bid price.  
 *       - Runner must have a "Runner" role  
 *       - Runner must have a verified KYC  
 *       - Prevents duplicate applications  
 *       - Prevents re-applying after rejection  
 *     tags:
 *       - Runner Applications
 *     security:
 *       - bearerAuth: []   # Requires authentication token
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the errand the runner is applying to
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
 *                 description: Optional proposed price. If omitted, runner accepts the listed price.
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Proposed price submitted for errand
 *                 data:
 *                   type: object
 *                   description: Runner application details
 *       400:
 *         description: Validation errors (not a runner, KYC not verified, duplicate application, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Errand not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/apply/:errandId', authenticated, applyForErrand);

/**
 * @swagger
 * /api/v1/errand/{errandId}:
 *   get:
 *     summary: Get all runner applications for a specific errand
 *     description: Returns all applications submitted by runners for a particular errand ID.
 *     tags:
 *       - Errands
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the errand
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pickupContact:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       runner:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           bio:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           totalJobs:
 *                             type: number
 *                       errandId:
 *                         type: string
 *       404:
 *         description: Errand not found
 *       500:
 *         description: Internal server error
 */
router.get('/errand/:errandId', authenticated, getErrandApplications);

/**
 * @swagger
 * /api/v1/{id}/status:
 *   put:
 *     summary: Update runner application status
 *     description: Update the status of a runner's application. A client cannot accept another runner if an accepted runner already exists for the same errand.
 *     tags:
 *       - Runner Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the runner application
 *         schema:
 *           type: string
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
 *                 example: Accepted
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: application accepted successfully
 *                 data:
 *                   $ref: '#/components/schemas/RunnerApplication'
 *       400:
 *         description: Bad request — invalid status or errand already has an accepted runner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This errand already has an accepted runner. You cannot accept another runner.
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application not found
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
 *     summary: Get applications for a specific errand by a specific runner
 *     description: Retrieve all applications submitted by a particular runner for a specific errand.
 *     tags:
 *       - Runner Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: ID of the errand
 *         schema:
 *           type: string
 *       - in: path
 *         name: runnerId
 *         required: true
 *         description: ID of the runner who applied
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Found 1 applications for this errand
 *                 pickupContact:
 *                   type: string
 *                   example: "+234 812 345 6789"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RunnerApplication'
 *       404:
 *         description: Errand or applications not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand not found
 */

router.get('/applicant/:errandId/:runnerId', authenticated, getErrandApplicationsForArunner)

/**
 * @swagger
 * /api/v1/errands/{errandId}/applications/{applicationId}/accept:
 *   patch:
 *     summary: Accept a runner's application for an errand
 *     description: |
 *       Allows the client who created the errand to **accept exactly one runner**.
 *       After accepting:
 *       - Errand is marked as "Assigned"
 *       - Runner is assigned to the errand
 *       - Other applications are automatically rejected
 *       - Start & delivery OTPs are generated
 *       - Runner receives acceptance notification
 *     tags:
 *       - Runner Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: ID of the errand
 *         schema:
 *           type: string
 *           example: 67adfc93c8aa57bcd45ae471
 *       - in: path
 *         name: applicationId
 *         required: true
 *         description: ID of the runner's application to accept
 *         schema:
 *           type: string
 *           example: 67adfc93c8aa57bcd45ae380
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
 *         description: Validation or business rule error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     alreadyAccepted: This errand already has an assigned runner. You cannot accept another.
 *       403:
 *         description: User is not the owner of this errand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to accept applications for this errand
 *       404:
 *         description: Errand or application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     errand: Errand not found
 *                     application: Application not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.patch('/errands/:errandId/applications/:applicationId/accept', authenticated, acceptRunnerApplication);

/**
 * @swagger
 * /api/v1/errands/{errandId}/applications/{applicationId}/reject:
 *   patch:
 *     summary: Reject a runner's application for an errand
 *     description: |
 *       Allows the client who created the errand to reject a runner's application.
 *       After rejecting:
 *       - Application is marked as **Rejected**
 *       - If no pending applications remain, errand becomes **Open** again
 *       - Runner receives a rejection notification
 *       - The application is deleted from the database
 *     tags:
 *       - Runner Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: ID of the errand
 *         schema:
 *           type: string
 *           example: 67adfc93c8aa57bcd45ae471
 *       - in: path
 *         name: applicationId
 *         required: true
 *         description: ID of the runner application to reject
 *         schema:
 *           type: string
 *           example: 67adfc93c8aa57bcd45ae380
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
 *                       $ref: '#/components/schemas/RunnerApplication'
 *       403:
 *         description: User is not allowed to reject applications for this errand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not authorized to reject applications for this errand
 *       404:
 *         description: Errand or application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     errand: Errand not found
 *                     application: Runner application not found for this errand
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
