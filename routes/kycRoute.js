const router = require('express').Router();
const uploads = require('../middleware/multer');
const { authenticated, isAdmin } = require('../middleware/authenticate');
const {
  submitKYC,
  getMyKYC,
  getAllKYC,
  updateKYCStatus,
} = require('../controllers/kycController');

/**
 * @swagger
 * /api/v1/kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     description: Allows an authenticated user to submit KYC documents (Government ID, Proof of Address, and Selfie with ID). All three images are required.
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - governmentIdCard
 *               - proofOfAddressImage
 *               - selfieWithIdCard
 *             properties:
 *               governmentIdCard:
 *                 type: string
 *                 format: binary
 *                 description: Upload government-issued ID card
 *               proofOfAddressImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload proof of address (e.g. utility bill)
 *               selfieWithIdCard:
 *                 type: string
 *                 format: binary
 *                 description: Upload a selfie holding your ID card
 *     responses:
 *       201:
 *         description: KYC submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: KYC submitted successfully. Awaiting review.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 82b7e6c0-1a25-4b9f-b2b4-93495b5c5221
 *                     userId:
 *                       type: string
 *                       example: 45b6e63a-12b8-44e0-a3b9-9f11462b1234
 *                     governmentIdCard:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/gov_id.jpg
 *                     proofOfAddressImage:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/address_proof.jpg
 *                     selfieWithIdCard:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/selfie_id.jpg
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Missing documents or KYC already submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All three documents are required
 *       401:
 *         description: Unauthorized — user not authenticated
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/submit', authenticated, uploads.fields([
    { name: 'governmentIdCard', maxCount: 1 },
    { name: 'proofOfAddressImage', maxCount: 1 },
    { name: 'selfieWithIdCard', maxCount: 1 },
  ]),
  submitKYC
);

/**
 * @swagger
 * /api/v1/kyc/my:
 *   get:
 *     summary: Get logged-in user's KYC details
 *     description: Fetches the KYC details of the currently authenticated user.
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fetched KYC details successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched KYC details successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 3e5a8c6f-0c1b-4e9b-9af1-bbce74b23412
 *                     userId:
 *                       type: string
 *                       example: 12b4f7c1-8a91-4e32-8c5b-ff37d55ab012
 *                     governmentIdCard:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/gov_id.jpg
 *                     proofOfAddressImage:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/address_proof.jpg
 *                     selfieWithIdCard:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/selfie_id.jpg
 *                     status:
 *                       type: string
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-28T12:34:56.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-29T10:15:23.000Z
 *       404:
 *         description: KYC not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: KYC not found
 *       401:
 *         description: Unauthorized — missing or invalid token
 */
router.get('/my', authenticated, getMyKYC);

/**
 * @swagger
 * /api/v1/kyc:
 *   get:
 *     summary: Get all KYC submissions (Admin only)
 *     description: Fetch all user KYC submissions, including basic user details. Accessible only by admins.
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fetched all KYC submissions successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched all KYC submissions successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 8f2dca3b-4f1a-48b3-bf23-cb7831f3e37a
 *                       userId:
 *                         type: string
 *                         example: 7e1b25f0-87f3-4dbf-8b4b-5e6fcb7cced9
 *                       governmentIdCard:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/gov_id.jpg
 *                       proofOfAddressImage:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/address_proof.jpg
 *                       selfieWithIdCard:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/selfie_id.jpg
 *                       status:
 *                         type: string
 *                         enum: [pending, approved, rejected, verified]
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-28T12:34:56.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-29T10:15:23.000Z
 *                       User:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 7e1b25f0-87f3-4dbf-8b4b-5e6fcb7cced9
 *                           fullName:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: johndoe@example.com
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — user is not an admin
 *       500:
 *         description: Internal Server Error
 */
router.get('/', isAdmin, getAllKYC);

/**
 * @swagger
 * /api/v1/kyc/{id}/status:
 *   put:
 *     summary: Update KYC status (Admin only)
 *     description: Allows an admin to update a user's KYC verification status (approved, rejected, or verified).
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the KYC record to update.
 *         schema:
 *           type: string
 *           example: 8f2dca3b-4f1a-48b3-bf23-cb7831f3e37a
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
 *                 enum: [approved, rejected, verified]
 *                 example: approved
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: KYC approved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 8f2dca3b-4f1a-48b3-bf23-cb7831f3e37a
 *                     userId:
 *                       type: string
 *                       example: 7e1b25f0-87f3-4dbf-8b4b-5e6fcb7cced9
 *                     governmentIdCard:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/gov_id.jpg
 *                     proofOfAddressImage:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/address_proof.jpg
 *                     selfieWithIdCard:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567/kyc_uploads/selfie_id.jpg
 *                     status:
 *                       type: string
 *                       example: approved
 *                     reviewedBy:
 *                       type: string
 *                       example: 1bcb0a62-89f2-4a9e-9b5c-937c6a71e1e4
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-29T10:15:23.000Z
 *       400:
 *         description: Invalid KYC status
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — user is not an admin
 *       404:
 *         description: KYC not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id/status', isAdmin, updateKYCStatus);

module.exports = router;
