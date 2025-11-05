const express = require('express');
const router = express.Router();
const { createErrand, getAllErrands, getErrandById, updateErrand, deleteErrand } = require('../controllers/errandController');
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
 *     summary: Get an errand by ID
 *     tags: [Errands]
 *     description: Retrieve details of a specific errand by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the errand to retrieve
 *         schema:
 *           type: string
 *           format: uuid
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
 *                   example: "Errand retrieved successfully"
 *                 data:
 *                   type: object
 *       404:
 *         description: Errand not found
 *       500:
 *         description: Server error while retrieving errand
 */
router.get('/errand/get/:id', getErrandById);

/**
 * @swagger
 * /api/v1/errand/update/{id}:
 *   put:
 *     summary: Update an existing errand
 *     tags: [Errands]
 *     description: Allows a client to update an existing errand. Only the owner (creator) of the errand can update it. Optionally supports updating the attachment file.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the errand to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Deliver package to Victoria Island"
 *               description:
 *                 type: string
 *                 example: "Deliver a new phone package to Victoria Island."
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
 *                 example: 5000
 *               attachments:
 *                 type: string
 *                 format: binary
 *                 description: Optional file attachment for the errand (image or document)
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
 *                   example: "Errand updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     pickupAddress:
 *                       type: string
 *                     deliveryAddress:
 *                       type: string
 *                     pickupContact:
 *                       type: string
 *                     price:
 *                       type: number
 *                     attachments:
 *                       type: object
 *                       properties:
 *                         publicId:
 *                           type: string
 *                         url:
 *                           type: string
 *       403:
 *         description: User not allowed to update this errand
 *       404:
 *         description: Errand not found
 *       500:
 *         description: Internal server error
 */
router.put('/errand/update/:id', authenticated, uploads.single('attachments'), updateErrand);

/**
 * @swagger
 * /api/v1/errand/delete/{id}:
 *   delete:
 *     summary: Delete an errand by ID
 *     tags: [Errands]
 *     description: Permanently remove an errand from the system by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the errand to delete
 *         schema:
 *           type: string
 *           format: uuid
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
 *                   example: "Errand deleted successfully"
 *       404:
 *         description: Errand not found
 *       500:
 *         description: Internal server error
 */
router.delete('/errand/delete/:id', deleteErrand);

module.exports = router;