// const express = require('express');
// const router = express.Router();
// const refundPayment = require('../controllers/refundPayment');

// /**
//  * @swagger
//  * tags:
//  *   name: Refunds
//  *   description: Handles refund operations for payments
//  */

// /**
//  * @swagger
//  * /api/v1/refundpayment:
//  *   post:
//  *     summary: Initiate a refund for a completed payment
//  *     description: >
//  *       This endpoint allows you to initiate a refund using Kora Pay for a specific transaction.
//  *       You can specify the amount to refund (for partial refunds) and a reason for the refund.
//  *     tags: [Refunds]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - paymentId
//  *             properties:
//  *               paymentId:
//  *                 type: string
//  *                 format: uuid
//  *                 example: "1c6e2a1b-34e4-49d2-b8e3-55e94c087123"
//  *                 description: The unique identifier of the payment to be refunded
//  *               amount:
//  *                 type: number
//  *                 example: 4500
//  *                 description: The amount to refund (optional — refunds full amount if omitted)
//  *               reason:
//  *                 type: string
//  *                 example: "Customer canceled the errand"
//  *                 description: Reason for initiating the refund
//  *     responses:
//  *       200:
//  *         description: Refund initiated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Refund initiated successfully
//  *                 refund:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: string
//  *                       example: "bb7e9b4c-cc5d-4787-8b7f-84c0b36f34e5"
//  *                     refundReference:
//  *                       type: string
//  *                       example: "REFUND-ABC12345"
//  *                     amount:
//  *                       type: number
//  *                       example: 4500
//  *                     status:
//  *                       type: string
//  *                       example: "processing"
//  *                     createdAt:
//  *                       type: string
//  *                       format: date-time
//  *                       example: "2025-11-05T10:30:45.123Z"
//  *       400:
//  *         description: Bad request — invalid paymentId or refund data
//  *       404:
//  *         description: Payment record not found
//  *       500:
//  *         description: Internal server error or Kora Pay refund failure
//  */

// router.post('/refundpayment', refundPayment.initiateRefund);



// module.exports = router;





const express = require('express');
const router = express.Router();
const refundPayment = require('../controllers/refundPayment');

/**
 * @swagger
 * tags:
 *   name: Refunds
 *   description: Manage refunds for customer payments, including admin verification
 */

/**
 * @swagger
 * /api/v1/refundpayment:
 *   post:
 *     summary: Request a refund for a completed payment
 *     description: >
 *       This endpoint allows a **customer** to request a refund for a specific payment.  
 *       The request is created in a `pending_admin_approval` state until an **admin verifies** it.
 *     tags: [Refunds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *                 format: uuid
 *                 example: "1c6e2a1b-34e4-49d2-b8e3-55e94c087123"
 *                 description: The unique identifier of the payment to be refunded.
 *               amount:
 *                 type: number
 *                 example: 4500
 *                 description: Amount to refund (optional — refunds full amount if omitted).
 *               reason:
 *                 type: string
 *                 example: "Customer canceled the errand"
 *                 description: Reason for requesting the refund.
 *     responses:
 *       200:
 *         description: Refund request created successfully and awaiting admin approval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refund request created successfully. Awaiting admin approval.
 *                 refund:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "b223d3aa-2b65-442a-8a33-ef8e2c2e1234"
 *                     refundReference:
 *                       type: string
 *                       example: "REF-98c1b2a1-923f-4e6f-8f2e-65e5c22f3cc2"
 *                     amount:
 *                       type: number
 *                       example: 4500
 *                     status:
 *                       type: string
 *                       example: pending_admin_approval
 *       400:
 *         description: Invalid paymentId or refund data
 *       404:
 *         description: Payment record not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/refundpayment/verify/{refundId}:
 *   post:
 *     summary: Verify and process a refund by admin
 *     description: >
 *       This endpoint allows an **admin** to verify and approve a pending refund request.  
 *       Once approved, the refund is initiated via **Kora Pay** API.
 *     tags: [Refunds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The refund ID to verify and process.
 *     responses:
 *       200:
 *         description: Refund verified and processed successfully by admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refund verified and processed successfully by admin.
 *                 refund:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "bb7e9b4c-cc5d-4787-8b7f-84c0b36f34e5"
 *                     refundReference:
 *                       type: string
 *                       example: "REFUND-ABC12345"
 *                     amount:
 *                       type: number
 *                       example: 4500
 *                     status:
 *                       type: string
 *                       example: processing
 *       403:
 *         description: Access denied — only admins can verify refunds.
 *       404:
 *         description: Refund record or payment not found.
 *       500:
 *         description: Internal server error or Kora Pay refund failure.
 */

router.post('/refundpayment', refundPayment.initiateRefund);
router.post('/refundpayment/verify/:refundId', refundPayment.verifyRefundByAdmin);

module.exports = router;
