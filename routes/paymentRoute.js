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

const { authenticated } = require('../middleware/authenticate')



const router = require('express').Router();




/**
 * @swagger
 * /api/v1/payment/initialize:
 *   post:
 *     summary: Initialize payment transaction
 *     description: Creates a new payment transaction between a client and runner for errand services.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
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
 *                 format: uuid
 *                 description: ID of the runner receiving the payment
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               amount:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 description: Payment amount in NGN
 *                 example: 5000.00
 *               description:
 *                 type: string
 *                 description: Description of the payment/errand service
 *                 example: "Payment for grocery shopping errand"
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment initialized successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     reference:
 *                       type: string
 *                       example: "TXN_20241201_001"
 *                     amount:
 *                       type: number
 *                       example: 5000.00
 *                     status:
 *                       type: string
 *                       enum: [Pending, Paid, Failed]
 *                       example: "Pending"
 *                     paymentUrl:
 *                       type: string
 *                       example: "https://checkout.korapay.com/..."
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid receiver ID or amount"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/initialize/:bookingId',authenticated, initializePayment);

/**
 * @swagger
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     summary: Verify payment status
 *     description: Checks the current status of a payment transaction using the payment reference.
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference number
 *         example: "TXN_20241201_001"
 *     responses:
 *       200:
 *         description: Payment verification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment verification completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       example: "TXN_20241201_001"
 *                     status:
 *                       type: string
 *                       enum: [Pending, Paid, Failed]
 *                       example: "Paid"
 *                     amount:
 *                       type: number
 *                       example: 5000.00
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-01T10:30:00Z"
 *                     transactionId:
 *                       type: string
 *                       example: "KPA_123456789"
 *       400:
 *         description: Bad request - Invalid reference or payment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Payment reference not found"
 */
router.get('/verify/:reference', verifyPaymentStatus);

/**
 * @swagger
 * /api/v1/payment/history:
 *   get:
 *     summary: Get payment history for authenticated user
 *     description: Retrieves the payment history of the authenticated user.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: receiverId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the receiver to filter payment history
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Paid, Failed]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
router.get('/history', authenticated, getPaymentHistoryByUser);






/**
 * @swagger
 * /api/v1/payment/commission/calculate:
 *   get:
 *     summary: Calculate commission amount
 *     description: Calculates the commission amount for a given transaction amount.
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *         description: Transaction amount to calculate commission for
 *         example: 5000.00
 *     responses:
 *       200:
 *         description: Commission calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Commission calculated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalAmount:
 *                       type: number
 *                       example: 5000.00
 *                     commissionRate:
 *                       type: number
 *                       example: 0.05
 *                     commissionAmount:
 *                       type: number
 *                       example: 250.00
 *                     netAmount:
 *                       type: number
 *                       example: 4750.00
 *       400:
 *         description: Bad request - Invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Valid amount is required"
 */
router.get('/commission/calculate',  calculateCommissionAmount);

/**
 * @swagger
 * /api/v1/payment/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     description: Retrieves the current wallet balance for the authenticated runner.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet balance retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       format: decimal
 *                       example: 15000.50
 *                     currency:
 *                       type: string
 *                       example: "NGN"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     lastTransactionAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-01T10:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Wallet not found for user
 */
router.get('/wallet/balance', authenticated,getWalletBalance);

/**
 * @swagger
 * /api/v1/payment/wallet/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet
 *     description: Processes a withdrawal request from the runner's wallet to their bank account.
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
 *                 format: float
 *                 minimum: 100
 *                 description: Amount to withdraw (minimum 100 NGN)
 *                 example: 5000.00
 *               bankDetailsId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the verified bank account to withdraw to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               narration:
 *                 type: string
 *                 description: Optional withdrawal description
 *                 example: "Withdrawal for personal use"
 *     responses:
 *       200:
 *         description: Withdrawal processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Withdrawal processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawalId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     amount:
 *                       type: number
 *                       example: 5000.00
 *                     status:
 *                       type: string
 *                       enum: [Pending, Processing, Completed, Failed]
 *                       example: "Pending"
 *                     reference:
 *                       type: string
 *                       example: "WTH_20241201_001"
 *                     bankDetails:
 *                       type: object
 *                       properties:
 *                         bankName:
 *                           type: string
 *                           example: "First Bank of Nigeria"
 *                         accountNumber:
 *                           type: string
 *                           example: "1234567890"
 *                         accountName:
 *                           type: string
 *                           example: "John Doe"
 *       400:
 *         description: Bad request - Insufficient funds or invalid bank details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Insufficient wallet balance"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/wallet/withdraw', withdrawFunds);

/**
 * @swagger
 * /api/v1/payment/banks:
 *   get:
 *     summary: Get list of supported banks
 *     description: Retrieves a list of all supported banks for account verification and withdrawals.
 *     tags: [Bank]
 *     parameters:
 *       - in: query
 *         name: countryCode
 *         schema:
 *           type: string
 *           default: "NG"
 *         description: Country code for bank list
 *         example: "NG"
 *     responses:
 *       200:
 *         description: Bank list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bank list retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: "033"
 *                       name:
 *                         type: string
 *                         example: "First Bank of Nigeria"
 *                       country:
 *                         type: string
 *                         example: "NG"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Bad request - Invalid country code
 */
router.get('/banks', getBanksList);

/**
 * @swagger
 * /api/v1/payment/banks/verify:
 *   post:
 *     summary: Verify bank account details
 *     description: Verifies the validity of bank account details before adding to user's profile.
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
 *                 description: Bank code (e.g., "033" for First Bank)
 *                 example: "033"
 *               account:
 *                 type: string
 *                 description: Bank account number
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Bank account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bank account verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountNumber:
 *                       type: string
 *                       example: "1234567890"
 *                     accountName:
 *                       type: string
 *                       example: "John Doe"
 *                     bankCode:
 *                       type: string
 *                       example: "033"
 *                     bankName:
 *                       type: string
 *                       example: "First Bank of Nigeria"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid bank account details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid bank account number"
 */
router.post('/banks/verify',  verifyBankAccountDetails);

/**
 * @swagger
 * /api/v1/payment/banks/details:
 *   post:
 *     summary: Add bank account details
 *     description: Adds verified bank account details to the authenticated runner's profile for withdrawals.
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
 *               - accountNumber
 *             properties:
 *               bankCode:
 *                 type: string
 *                 description: Bank code (e.g., "033" for First Bank)
 *                 example: "033"
 *               accountNumber:
 *                 type: string
 *                 description: Bank account number
 *                 example: "1234567890"
 *               nepaBillUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to NEPA bill for address verification
 *                 example: "https://example.com/nepa-bill.pdf"
 *     responses:
 *       201:
 *         description: Bank details added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bank details added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     bankCode:
 *                       type: string
 *                       example: "033"
 *                     bankName:
 *                       type: string
 *                       example: "First Bank of Nigeria"
 *                     accountNumber:
 *                       type: string
 *                       example: "1234567890"
 *                     accountName:
 *                       type: string
 *                       example: "John Doe"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid bank details or account already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/banks/details', authenticated, addBankDetails);

/**
 * @swagger
 * /api/v1/payment/banks/details:
 *   post:
 *     summary: Add runner bank account details
 *     description: Adds or updates a bank account for the authenticated runner.
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               runnerId:
 *                 type: string
 *                 format: uuid
 *                 description: Runner's user ID (optional if using authenticated token)
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               bankCode:
 *                 type: string
 *                 description: Bank code
 *                 example: "033"
 *               bankName:
 *                 type: string
 *                 description: Name of the bank
 *                 example: "First Bank of Nigeria"
 *               accountNumber:
 *                 type: string
 *                 description: Bank account number
 *                 example: "1234567890"
 *               accountName:
 *                 type: string
 *                 description: Name of the account holder
 *                 example: "John Doe"
 *               nepaBillUrl:
 *                 type: string
 *                 format: uri
 *                 description: Optional URL to a utility bill for verification
 *                 example: "https://example.com/nepa-bill.jpg"
 *             required:
 *               - bankCode
 *               - accountNumber
 *               - accountName
 *     responses:
 *       201:
 *         description: Bank details added or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bank details added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bankDetailsId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     runnerId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     bankDetails:
 *                       type: object
 *                       properties:
 *                         bankCode:
 *                           type: string
 *                           example: "033"
 *                         bankName:
 *                           type: string
 *                           example: "First Bank of Nigeria"
 *                         accountNumber:
 *                           type: string
 *                           example: "1234567890"
 *                         accountName:
 *                           type: string
 *                           example: "John Doe"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Missing or invalid fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Runner not found
 */


router.get('/banks/details',getRunnerBankDetailsList);

/**
 * @swagger
 * /api/v1/payment/webhook:
 *   post:
 *     summary: Process payment webhook
 *     description: Handles incoming webhook notifications from payment providers (Korapay) for payment status updates.
 *     tags: [Webhook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "charge.success"
 *               data:
 *                 type: object
 *                 properties:
 *                   reference:
 *                     type: string
 *                     example: "TXN_20241201_001"
 *                   status:
 *                     type: string
 *                     example: "success"
 *                   amount:
 *                     type: number
 *                     example: 5000.00
 *                   currency:
 *                     type: string
 *                     example: "NGN"
 *                   transactionId:
 *                     type: string
 *                     example: "KPA_123456789"
 *     parameters:
 *       - in: header
 *         name: x-korapay-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook signature for verification
 *         example: "sha256=abc123..."
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: boolean
 *                       example: true
 *                     reference:
 *                       type: string
 *                       example: "TXN_20241201_001"
 *       400:
 *         description: Bad request - Missing signature or invalid webhook data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing webhook signature"
 */
router.post('/webhook', processWebhook);

module.exports = router;
