const express = require('express')
const router = express.Router();

const { initializePayment, verifyPayment, getAllPayments, getOnePayment, webhook } = require('../controller/paymentsController');
const { checkPaymentExists } = require('../middleware/paymentMiddleware');

router.post('/initialize', initializePayment);
router.get('/payments/verify/:reference',checkPaymentExists,verifyPayment);

router.get('/payments',getAllPayments);

router.get('/payments/:id',getOnePayment);

router.post('/payments/webhook',webhook)

module.exports = router;