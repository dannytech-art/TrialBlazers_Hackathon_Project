const {
    initializeClientPayment,
    verifyPayment,
    getRunnerWalletBalance,
    processRunnerWithdrawal,
    getPaymentHistory,
    getBankList,
    verifyBankAccount,
    addRunnerBankDetails,
    getRunnerBankDetails,
    handleWebhook,
    calculateCommission
} = require('../services/payment');

const initializePayment = async (req, res) => {
    try {
        const { receiverId, amount, description } = req.body;
        const payerId = req.user?.id || req.body.payerId;


        const paymentData = {
            payerId,
            receiverId,
            amount,
            description,
            payer: {
    fullName: req.user ? `${req.user.firstName} ${req.user.lastName}` : req.body.fullName || 'Anonymous',
    email: req.user ? req.user.email : req.body.email || 'noemail@example.com'
}

        };

        const result = await initializeClientPayment(paymentData);

        res.status(201).json({
            success: true,
            message: 'Payment initialized successfully',
            data: result
        });

    } catch (error) {
        console.error('Error initializing payment:', error);
        res.status(400).json({
            success: false,
            message: error.message
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
       const userId = req.body?.userId || req.query?.userId || req.user?.id || 	'04520f34-7e78-43e5-a905-ec9f6bd713f0';


if (!userId) {
  return res.status(400).json({
    success: false,
    message: "userId is required (provide in token, body, or query)"
  });
}


       const userType = req.user?.role?.toLowerCase() || 'user';

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
        const { bankCode, accountNumber, nepaBillUrl } = req.body;
        const runnerId = req.user?.id || req.body.runnerId || req.query.runnerId;


        const bankDetailsData = {
            runnerId,
            bankCode,
            accountNumber,
            nepaBillUrl
        };

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
