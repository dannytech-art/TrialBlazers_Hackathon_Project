const express = require('express');
const router = express.Router();
const { createErrand, getAllErrands, getErrandById, updateErrand, deleteErrand, getErrandByClientId,getErrandByRunnerId, verifyStartOtp, verifyDeliveryOtp } = require('../controllers/errandController');
const { postErrandValidator } = require('../middleware/validator');
const { authenticated } = require('../middleware/authenticate');
const uploads = require('../middleware/multer'); // multer config for file uploads

/**
 * @swagger
 * /api/v1/errand/create:
 *   post:
 *     summary: Create a new errand
 *     tags: [Errands]
 *     description: Allows an authenticated user to create a new errand request. Supports file upload for attachments.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - pickupAddress
 *               - deliveryAddress
 *               - pickupContact
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Deliver documents to the office"
 *               description:
 *                 type: string
 *                 example: "Pick up files from my house and deliver them to the company"
 *               pickupAddress:
 *                 type: string
 *                 example: "Lekki Phase 1, Lagos"
 *               deliveryAddress:
 *                 type: string
 *                 example: "Victoria Island, Lagos"
 *               pickupContact:
 *                 type: string
 *                 example: "08012345678"
 *               price:
 *                 type: number
 *                 example: 2500
 *               attachments:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Errand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Errand created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing or invalid data
 *       500:
 *         description: Server error while creating errand
 */
router.post('/errand/create', authenticated, uploads.single('attachments'), postErrandValidator, createErrand);

/**
 * @swagger
 * /api/v1/errand/getall:
 *   get:
 *     summary: Retrieve all errands
 *     tags: [Errands]
 *     description: Fetches a list of all errands created by users.
 *     responses:
 *       200:
 *         description: List of all errands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All errands retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "e3f9d7e0-82c6-4a7f-94d5-0b44f9c85f21"
 *                       userId:
 *                         type: string
 *                         example: "a9c3b5d7-ef2a-43de-9104-1d8c7f1b7e55"
 *                       title:
 *                         type: string
 *                         example: "Deliver groceries"
 *                       pickupAddress:
 *                         type: string
 *                         example: "Yaba, Lagos"
 *                       deliveryAddress:
 *                         type: string
 *                         example: "Ikeja, Lagos"
 *                       pickupContact:
 *                         type: string
 *                         example: "08123456789"
 *                       price:
 *                         type: number
 *                         example: 3500
 *                       status:
 *                         type: string
 *                         example: "Open"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-24T10:15:30Z"
 *       404:
 *         description: No errands found
 *       500:
 *         description: Internal server error
 */
router.get('/errand/getall', getAllErrands);

/**
 * @swagger
 * /api/v1/errand/get/{id}:
 *   get:
 *     summary: Get a single errand by ID
 *     description: Retrieves detailed information about an errand, including poster and assigned runner details.
 *     tags:
 *       - Errands
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the errand to retrieve
 *     responses:
 *       200:
 *         description: Errand retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand retrieved successfully
 *                 data:
 *                   type: object
 *                   description: Errand object
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
router.get('/errand/get/:id', getErrandById);

/**
 * @swagger
 * /api/v1/errand/update/{id}:
 *   put:
 *     summary: Update an existing errand
 *     description: Updates an errand's details. Only the creator of the errand can update it. Supports optional image upload.
 *     tags:
 *       - Errands
 *     security:
 *       - bearerAuth: []   # If JWT authentication is used
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the errand to update
 *         schema:
 *           type: string
 *           example: "692810a6ca635ffc7d37f016"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Pick up documents"
 *               description:
 *                 type: string
 *                 example: "Go to Yaba and pick up my printed documents"
 *               pickupAddress:
 *                 type: string
 *                 example: "12, Herbert Macaulay Road, Yaba"
 *               deliveryAddress:
 *                 type: string
 *                 example: "Lekki Phase 1"
 *               pickupContact:
 *                 type: string
 *                 example: "+2348144455667"
 *               price:
 *                 type: number
 *                 example: 3500
 *               attachments:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file to upload
 *     responses:
 *       200:
 *         description: Errand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated errand object
 *       403:
 *         description: Not allowed to update this errand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You are not allowed to update this errand
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
router.put('/errand/update/:id', authenticated, uploads.single('attachments'), updateErrand);

/**
 * @swagger
 * /api/v1/errand/delete/{id}:
 *   delete:
 *     summary: Delete an errand
 *     description: Deletes an errand by ID. Only accessible to the owner (if authentication is applied).
 *     tags:
 *       - Errands
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the errand to delete
 *         schema:
 *           type: string
 *           example: "692810a6ca635ffc7d37f016"
 *     responses:
 *       200:
 *         description: Errand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand deleted successfully
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
router.delete('/errand/delete/:id', deleteErrand);

/**
 * @swagger
 * /api/v1/errand/my-errands:
 *   get:
 *     summary: Get all errands created by the authenticated client
 *     description: Retrieves all errands associated with the currently authenticated user's ID (extracted from the JWT token).
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's errands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errands retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Deliver package
 *                       description:
 *                         type: string
 *                         example: Deliver package to client in Lagos
 *                       status:
 *                         type: string
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           firstName:
 *                             type: string
 *                             example: Daniel
 *                           lastName:
 *                             type: string
 *                             example: Johnson
 *                           email:
 *                             type: string
 *                             example: daniel@example.com
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error while fetching errands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error while fetching errand
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.get('/errand/my-errands', authenticated, getErrandByClientId);


/**
 * @swagger
 * /api/v1/errand/runner-errands:
 *   get:
 *     summary: Get all errands created by the authenticated client
 *     description: Retrieves all errands associated with the currently authenticated user's ID (extracted from the JWT token).
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's errands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errands retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Deliver package
 *                       description:
 *                         type: string
 *                         example: Deliver package to client in Lagos
 *                       status:
 *                         type: string
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           firstName:
 *                             type: string
 *                             example: Daniel
 *                           lastName:
 *                             type: string
 *                             example: Johnson
 *                           email:
 *                             type: string
 *                             example: daniel@example.com
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error while fetching errands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error while fetching errand
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.get('/errand/runner-errands', authenticated, getErrandByRunnerId);

/**
 * @swagger
 * /api/v1/errands/{errandId}/verify-start:
 *   put:
 *     summary: Verify start OTP for an errand
 *     description: 
 *       Runner submits the start OTP given by the client. 
 *       If correct, the OTP is cleared and the errand can proceed to the next phase.
 *     tags:
 *       - Errands
 *     security:
 *       - UserAuth: []     # Adjust to match your actual auth name
 *     parameters:
 *       - in: path
 *         name: errandId
 *         description: ID of the errand for which the start OTP is being verified
 *         required: true
 *         schema:
 *           type: string
 *           example: "692810a6ca635ffc7d37f016"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The 4-digit OTP sent to the client for starting the errand
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Start OTP verified
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       404:
 *         description: Errand or application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application not found
 */
router.put('/errands/:errandId/verify-start', authenticated, verifyStartOtp);

/**
 * @swagger
 * /api/v1/errands/{errandId}/verify-delivery:
 *   put:
 *     summary: Verify delivery OTP and complete the errand
 *     description: 
 *       Verifies the delivery OTP provided by the runner. 
 *       If correct, the errand is marked as completed and the runner's wallet is credited.
 *     tags:
 *       - Errands
 *     security:
 *       - UserAuth: []    # Auth middleware name
 *     parameters:
 *       - in: path
 *         name: errandId
 *         required: true
 *         description: ID of the errand to verify delivery OTP for
 *         schema:
 *           type: string
 *           example: 692810a6ca635ffc7d37f016
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the client for delivery confirmation
 *                 example: "4567"
 *     responses:
 *       200:
 *         description: Delivery OTP verified successfully, wallet credited
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delivery OTP verified! Crediting NGN 4500 to your wallet.
 *                 creditedAmount:
 *                   type: number
 *                   example: 4500
 *                 walletBalance:
 *                   type: number
 *                   example: 12000
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       404:
 *         description: Errand or Application not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Errand not found 
 */
router.put('/errands/:errandId/verify-delivery', authenticated, verifyDeliveryOtp)

 
module.exports = router;

