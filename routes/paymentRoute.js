const {
    initializePayment,
    verifyPaymentStatus,
    getWalletBalance,
    withdrawFunds,
    getPaymentHistoryByUser,
    getBanksList,
    verifyBankAccountDetails,
    addBankDetails,
    getRunnerBankDetailsList,
    processWebhook,
    calculateCommissionAmount
} = require('../controllers/paymentController');

const { authenticated } = require('../middleware/authenticate');

const router = require('express').Router();

/**
 * @swagger
 * /api/v1/payment/initialize/{bookingId}:
 *   post:
 *     summary: Initialize payment transaction
 *     description: Creates a new payment transaction between a client and runner for errand services.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - amount
 *               - description
 *             properties:
 *               receiverId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               amount:
 *                 type: number
 *                 example: 5000
 *               description:
 *                 type: string
 *                 example: "Payment for grocery shopping errand"
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 */
router.post('/initialize/:bookingId', authenticated, initializePayment);

/**
 * @swagger
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     summary: Verify payment status
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verification completed
 */
router.get('/verify/:reference', verifyPaymentStatus);

/**
 * @swagger
 * /api/v1/payment/history:
 *   get:
 *     summary: Get payment history for authenticated user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: receiverId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Paid, Failed]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
router.get('/history', authenticated, getPaymentHistoryByUser);

/**
 * @swagger
 * /api/v1/payment/commission/calculate:
 *   get:
 *     summary: Calculate commission amount
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Commission calculated successfully
 */
router.get('/commission/calculate', calculateCommissionAmount);

/**
 * @swagger
 * /api/v1/wallet/runner/{runnerId}:
 *   get:
 *     summary: Get a runner's wallet balance
 *     description: Retrieves the wallet details and current balance of a runner. If the wallet does not exist, a new wallet is automatically created.
 *     tags:
 *       - Wallet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runnerId
 *         required: true
 *         description: ID of the runner whose wallet balance you want to fetch
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Wallet details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 walletId:
 *                   type: string
 *                   example: "22a8c3d1-bf90-4b59-9ac3-4b902f72c155"
 *                 runnerId:
 *                   type: string
 *                   example: "d89c3ab1-02c3-4122-a9cc-f12b12d67452"
 *                 balance:
 *                   type: number
 *                   example: 15000.50
 *                 currency:
 *                   type: string
 *                   example: "NGN"
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 lastTransactionAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-18T12:45:32.000Z"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-18T10:20:15.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-18T12:45:32.000Z"
 *       400:
 *         description: Invalid user or unauthorized access
 *       404:
 *         description: Runner not found
 */

router.get('/wallet/runner/:runnerId', authenticated, getWalletBalance);

/**
 * @swagger
 * /api/v1/payment/wallet/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - bankDetailsId
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               bankDetailsId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               narration:
 *                 type: string
 *                 example: "Withdrawal for personal use"
 *     responses:
 *       200:
 *         description: Withdrawal processed successfully
 */
router.post('/wallet/withdraw', authenticated, withdrawFunds);

/**
 * @swagger
 * /api/v1/payment/banks:
 *   get:
 *     summary: Get list of supported banks
 *     tags: [Bank]
 *     parameters:
 *       - in: query
 *         name: countryCode
 *         schema:
 *           type: string
 *           default: "NG"
 *     responses:
 *       200:
 *         description: Bank list retrieved successfully
 */
router.get('/banks', getBanksList);

/**
 * @swagger
 * /api/v1/payment/banks/verify:
 *   post:
 *     summary: Verify bank account details
 *     tags: [Bank]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bank
 *               - account
 *             properties:
 *               bank:
 *                 type: string
 *                 example: "033"
 *               account:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Bank account verified successfully
 */
router.post('/banks/verify', verifyBankAccountDetails);

/**
 * @swagger
 * /api/v1/payment/banks/details:
 *   post:
 *     summary: Add bank account details
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankCode
 *               - bankName
 *               - accountNumber
 *               - accountName
 *             properties:
 *               bankCode:
 *                 type: string
 *                 example: "033"
 *               bankName:
 *                 type: string
 *                 example: "First Bank of Nigeria"
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               accountName:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Bank details added successfully
 */
router.post('/banks/details', authenticated, addBankDetails);

/**
 * @swagger
 * /api/v1/payment/banks/details:
 *   get:
 *     summary: Get runner bank account details
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details fetched successfully
 */
router.get('/banks/details', authenticated, getRunnerBankDetailsList);

/**
 * @swagger
 * /api/v1/payment/webhook:
 *   post:
 *     summary: Process payment webhook
 *     tags: [Webhook]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook', processWebhook);

module.exports = router;
