
const User = require('../models/users');
const Errands = require('../models/errand');
const Payment = require('../models/payment');
const axios = require('axios');

const initializePayment = async (req, res) => {
    try {

        const { description } = req.body;
        const bookingId = req.params.bookingId; // fixed typo

        const findBooking = await Errands.findByPk(bookingId);

        if (!findBooking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // create payment record
        const payment = await Payment.create({
            payerId: findBooking.userId,
            receiverId:findBooking.assignedTo,
            amount: findBooking.price,
            description,
            status: 'Pending'
        });

        const koraPayload = {
   
            reference: `${findBooking.id}_${Math.floor(Math.random()*2300)}`,

            amount: findBooking.price,
            currency: 'NGN',
            redirect_url: 'https://errand-hive.vercel.app/dashboard/success',
            customer: {
                name: req.user?.firstName || 'Anonymous User',
                email: req.user?.email
            },
              narration: description || 'Errand payment', 

        };
console.log(koraPayload )
        const response = await axios.post(
            `https://api.korapay.com/merchant/api/v1/charges/initialize`,
            koraPayload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.data) {
            await payment.update({
                transactionId: response.data.data.reference,
                paymentStatus: response.data.data.status
            });
        }

        res.status(201).json({
            success: true,
            message: 'Payment initialized successfully',
            data: response.data
        });

    } catch (error) {
        console.error('Kora Error Response:', error.response?.data);

        console.error('Error initializing payment:', error);
        res.status(400).json({
            success: false,
            message:  error.response?.data
        });
    }
};

const verifyPaymentStatus = async (req, res) => {
    try {
        const { reference } = req.params;

        const result = await verifyPayment(reference);

        res.status(200).json({
            success: true,
            message: 'Payment verification completed',
            data: result
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getWalletBalance = async (req, res) => {
    try {
        const runnerId = req.user?.id || req.query.runnerId;

        

        const result = await getRunnerWalletBalance(runnerId);

        res.status(200).json({
            success: true,
            message: 'Wallet balance retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error getting wallet balance:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const withdrawFunds = async (req, res) => {
    try {
        const { amount, bankDetailsId, narration } = req.body;
        const runnerId =  req.user?.id || req.query.runnerId;

        const withdrawalData = {
            runnerId,
            amount,
            bankDetailsId,
            narration
        };

        const result = await processRunnerWithdrawal(withdrawalData);

        res.status(200).json({
            success: true,
            message: 'Withdrawal processed successfully',
            data: result
        });

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getPaymentHistoryByUser = async (req, res) => {
    try {

       const userId = req.user.id
const user = await User.findByPk(userId)

if (!user) {
  return res.status(400).json({
    success: false,
    message: "userId is required (provide in token, body, or query)"
  });
};


       const userType = req.user?.role || 'user';
     

        const { 
            dateFrom, 
            dateTo, 
            status, 
            type, 
            limit, 
            offset 
        } = req.query;

        const filters = {};
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (limit) filters.limit = parseInt(limit);
        if (offset) filters.offset = parseInt(offset);

        const result = await getPaymentHistory(userId, userType, filters);

        res.status(200).json({
            success: true,
            message: 'Payment history retrieved successfully',
            data: result
        });
        //

    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getBanksList = async (req, res) => {
    try {
        const { countryCode = 'NG' } = req.query;

        const result = await getBankList(countryCode);

        res.status(200).json({
            success: true,
            message: 'Bank list retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error getting bank list:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const verifyBankAccountDetails = async (req, res) => {
    try {
        const { bank, account } = req.body;

        const result = await verifyBankAccount({ bank, account });

        res.status(200).json({
            success: true,
            message: 'Bank account verified successfully',
            data: result
        });

    } catch (error) {
        console.error('Error verifying bank account:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const addBankDetails = async (req, res) => {
    try {
        const { bankCode, bankName, accountNumber, accountName } = req.body;
        const runnerId = req.user?.id || req.body.runnerId || req.query.runnerId;

        const bankDetailsData = { runnerId, bankCode, bankName, accountNumber, accountName };

        const result = await addRunnerBankDetails(bankDetailsData);

        res.status(201).json({
            success: true,
            message: 'Bank details added successfully',
            data: result
        });

    } catch (error) {
        console.error('Error adding bank details:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getRunnerBankDetailsList = async (req, res) => {
    try {
        const runnerId = req.user?.id || req.query.runnerId;

        const result = await getRunnerBankDetails(runnerId);

        res.status(200).json({
            success: true,
            message: 'Bank details retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error getting bank details:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const processWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-korapay-signature'];
        const webhookData = req.body;

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing webhook signature'
            });
        }

        const result = await handleWebhook(webhookData, signature);

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            data: result
        });

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const calculateCommissionAmount = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const result = calculateCommission(amount);

        res.status(200).json({
            success: true,
            message: 'Commission calculated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error calculating commission:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
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
};
