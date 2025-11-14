const axios = require('axios');
const Payment = require('../../../models/payment');
const User = require('../../../models/users');
const Wallet = require('../../../models/wallet');
const WalletTransaction = require('../../../models/wallettransaction');
const RunnerBankDetails = require('../../../models/runnerbankdetails');
const config = require('../config');
const { validatePaymentData, validateWithdrawalData, validateBankDetailsData, validateAccountData } = require('../validation');
const { calculateCommission, determinePaymentType, determinePaymentDirection, getCounterparty, calculateWalletImpact } = require('../utils');

const verifyPayment = async (reference) => {
    try {
        if (!reference) {
            throw new Error('Payment reference is required');
        }
        
        console.log(`Verifying payment with reference: ${reference}`);
        
        const response = await axios.get(
            `${config.KORA_API_URL}/transactions/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${config.KORA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log('KoraPay verification response received');
        
        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from KoraPay API');
        }
        
        const transactionData = response.data.data;
        
        const payment = await Payment.findOne({
            where: { id: reference }
        });
        
        if (!payment) {
            throw new Error(`Payment record not found for reference: ${reference}`);
        }
        
        let paymentStatus = 'Pending';
        let isSuccessful = false;
        
        if (transactionData.status === 'success' || transactionData.status === 'successful') {
            paymentStatus = 'Paid';
            isSuccessful = true;
        } else if (transactionData.status === 'failed' || transactionData.status === 'cancelled') {
            paymentStatus = 'Failed';
        }
        
        await Payment.update(
            {
                paymentStatus: paymentStatus,
                transactionId: transactionData.reference || reference,
                updatedAt: new Date()
            },
            { where: { id: reference } }
        );
        
        console.log(`Payment status updated to: ${paymentStatus}`);
        
        if (isSuccessful) {
            await topUpRunnerWallet(payment);
            console.log(`Runner wallet topped up successfully`);
        }
        
        const { sendPaymentNotifications } = require('../notifications');
        await sendPaymentNotifications(payment, paymentStatus, transactionData);
        
        return {
            success: true,
            paymentId: reference,
            status: paymentStatus,
            amount: transactionData.amount || payment.amount * 100,
            currency: transactionData.currency || 'NGN',
            transactionId: transactionData.reference || reference,
            isSuccessful: isSuccessful,
            koraResponse: transactionData,
            message: `Payment verification completed. Status: ${paymentStatus}`,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        
        try {
            await Payment.update(
                { paymentStatus: 'Failed' },
                { where: { id: reference } }
            );
        } catch (dbError) {
            console.error('Error updating payment status after verification failure:', dbError);
        }
        
        throw new Error(`Failed to verify payment: ${error.message}`);
    }
};

const topUpRunnerWallet = async (payment) => {
    try {
        console.log(`Topping up runner wallet for user: ${payment.receiverId}`);
        console.log(`Amount to add: ${payment.amount} NGN`);
        
        const runner = await User.findOne({
            where: { 
                id: payment.receiverId,
                role: 'Runner'
            }
        });
        
        if (!runner) {
            throw new Error(`User ${payment.receiverId} is not a runner or does not exist`);
        }
        
        let runnerWallet = await Wallet.findOne({
            where: { runnerId: payment.receiverId }
        });
        
        if (!runnerWallet) {
            runnerWallet = await Wallet.create({
                runnerId: payment.receiverId,
                balance: 0.00,
                currency: 'NGN',
                isActive: true
            });
            console.log(`Created new wallet for runner: ${payment.receiverId}`);
        }
        
        const totalAmount = parseFloat(payment.amount);
        const commissionAmount = (totalAmount * config.COMMISSION_PERCENTAGE) / 100;
        const amountToAdd = totalAmount - commissionAmount;
        
        const balanceBefore = parseFloat(runnerWallet.balance);
        const balanceAfter = balanceBefore + amountToAdd;
        
        await runnerWallet.update({
            balance: balanceAfter,
            lastTransactionAt: new Date()
        });
        
        await WalletTransaction.create({
            walletId: runnerWallet.id,
            amount: amountToAdd,
            type: 'credit',
            description: `Payment from client: ${payment.payerId} (after ${config.COMMISSION_PERCENTAGE}% commission)`,
            reference: payment.id,
            status: 'completed',
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            metadata: {
                paymentId: payment.id,
                payerId: payment.payerId,
                paymentMethod: payment.paymentMethod || 'KoraPay',
                paymentDescription: payment.description,
                totalAmount: totalAmount,
                commissionPercentage: config.COMMISSION_PERCENTAGE,
                commissionAmount: commissionAmount,
                amountAfterCommission: amountToAdd
            }
        });
        
        console.log(`Runner wallet topped up successfully`);
        console.log(`Total payment amount: ${totalAmount} NGN`);
        console.log(`Commission (${config.COMMISSION_PERCENTAGE}%): ${commissionAmount} NGN`);
        console.log(`Amount added to wallet: ${amountToAdd} NGN`);
        console.log(`Balance before: ${balanceBefore} NGN`);
        console.log(`Balance after: ${balanceAfter} NGN`);
        
        return {
            success: true,
            walletId: runnerWallet.id,
            balanceBefore: balanceBefore,
            totalAmount: totalAmount,
            commissionPercentage: config.COMMISSION_PERCENTAGE,
            commissionAmount: commissionAmount,
            amountAdded: amountToAdd,
            balanceAfter: balanceAfter,
            transactionId: payment.id
        };
        
    } catch (error) {
        console.error('Error topping up runner wallet:', error);
        throw new Error(`Failed to top up runner wallet: ${error.message}`);
    }
};

const getRunnerWalletBalance = async (runnerId) => {
    try {
        
        const runner = await User.findByPk(runnerId);

if (!runner) {
  throw new Error(`User ${runnerId} does not exist`);
}

if (runner.role !== 'Runner') {
  throw new Error(`User ${runnerId} is not authorized to access runner wallet`);
}

        
        let runnerWallet = await Wallet.findOne({
            where: { runnerId: runnerId }
        });
        
        if (!runnerWallet) {
            runnerWallet = await Wallet.create({
                runnerId: runnerId,
                balance: 0.00,
                currency: 'NGN',
                isActive: true
            });
            console.log(`Created new wallet for runner: ${runnerId}`);
        }
        
        return {
            success: true,
            walletId: runnerWallet.id,
            runnerId: runnerWallet.runnerId,
            balance: parseFloat(runnerWallet.balance),
            currency: runnerWallet.currency,
            isActive: runnerWallet.isActive,
            lastTransactionAt: runnerWallet.lastTransactionAt,
            createdAt: runnerWallet.createdAt,
            updatedAt: runnerWallet.updatedAt
        };
        
    } catch (error) {
        console.error('Error getting runner wallet balance:', error);
        throw new Error(`Failed to get runner wallet balance: ${error.message}`);
    }
};

const processRunnerWithdrawal = async (withdrawalData) => {
    try {
        validateWithdrawalData(withdrawalData);
        
        console.log(`Processing withdrawal for runner: ${withdrawalData.runnerId}`);
        console.log(`Amount: ${withdrawalData.amount} NGN`);
        
        const runner = await User.findOne({
            where: { 
                id: withdrawalData.runnerId,
                role: 'Runner'
            }
        });
        
        if (!runner) {
            throw new Error(`User ${withdrawalData.runnerId} is not a runner or does not exist`);
        }
        
        const runnerWallet = await Wallet.findOne({
            where: { runnerId: withdrawalData.runnerId }
        });
        
        if (!runnerWallet) {
            throw new Error(`Wallet not found for runner: ${withdrawalData.runnerId}`);
        }
        
        const currentBalance = parseFloat(runnerWallet.balance);
        const withdrawalAmount = parseFloat(withdrawalData.amount);
        
        if (currentBalance < withdrawalAmount) {
            throw new Error(`Insufficient balance. Current balance: ${currentBalance} NGN, Requested: ${withdrawalAmount} NGN`);
        }
        
        const bankDetails = await RunnerBankDetails.findOne({
            where: { 
                id: withdrawalData.bankDetailsId,
                runnerId: withdrawalData.runnerId,
                isActive: true,
                isVerified: true
            }
        });
        
        if (!bankDetails) {
            throw new Error(`Verified bank details not found for runner: ${withdrawalData.runnerId}`);
        }
        
        const withdrawalReference = `WTH_${Date.now()}_${withdrawalData.runnerId.slice(-8)}`;
        
        const koraPayload = {
            reference: withdrawalReference,
            destination: {
                type: "bank_account",
                amount: withdrawalAmount,
                currency: "NGN",
                narration: withdrawalData.narration || `Withdrawal for ${runner.firstName} ${runner.lastName}`,
                bank_account: {
                    bank: bankDetails.bankCode,
                    account: bankDetails.accountNumber,
                    account_name: bankDetails.accountName
                },
                customer: {
                    name: `${runner.firstName} ${runner.lastName}`,
                    email: runner.email
                }
            }
        };
        
        console.log('Calling KoraPay disbursement API...');
        
        const response = await axios.post(
            `${config.KORA_API_URL}/transactions/disburse`,
            koraPayload,
            {
                headers: {
                    Authorization: `Bearer ${config.KORA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('KoraPay disbursement response received');
        
        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from KoraPay disbursement API');
        }
        
        const disbursementData = response.data.data;
        
        const newBalance = currentBalance - withdrawalAmount;
        await runnerWallet.update({
            balance: newBalance,
            lastTransactionAt: new Date()
        });
        
        await WalletTransaction.create({
            walletId: runnerWallet.id,
            amount: withdrawalAmount,
            type: 'debit',
            description: `Withdrawal to ${bankDetails.bankName} - ${bankDetails.accountNumber}`,
            reference: withdrawalReference,
            status: 'completed',
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            metadata: {
                withdrawalReference: withdrawalReference,
                bankDetailsId: bankDetails.id,
                bankName: bankDetails.bankName,
                bankCode: bankDetails.bankCode,
                accountNumber: bankDetails.accountNumber,
                accountName: bankDetails.accountName,
                koraResponse: disbursementData
            }
        });
        
        await Payment.create({
            id: withdrawalReference,
            payerId: withdrawalData.runnerId,
            receiverId: withdrawalData.runnerId,
            amount: withdrawalAmount,
            description: withdrawalData.narration || 'Withdrawal to bank account',
            transactionId: disbursementData.reference || withdrawalReference,
            paymentStatus: disbursementData.status === 'processing' ? 'Pending' : 'Paid',
            paymentMethod: 'KoraPay Disbursement'
        });
        
        console.log(`Withdrawal processed successfully`);
        console.log(`Amount withdrawn: ${withdrawalAmount} NGN`);
        console.log(`New balance: ${newBalance} NGN`);
        console.log(`Bank: ${bankDetails.bankName}`);
        console.log(`Account: ${bankDetails.accountNumber}`);
        
        return {
            success: true,
            withdrawalReference: withdrawalReference,
            amount: withdrawalAmount,
            currency: 'NGN',
            bankDetails: {
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                accountName: bankDetails.accountName
            },
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            koraResponse: disbursementData,
            message: 'Withdrawal processed successfully'
        };
        
    } catch (error) {
        console.error('Error processing runner withdrawal:', error);
        throw new Error(`Failed to process withdrawal: ${error.message}`);
    }
};

const getPaymentHistory = async (userId, userType, filters = {}) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        if (!['Client', 'Runner'].includes(userType)) {
            throw new Error('User type must be either "client" or "runner"');
        }
        
        console.log(`Getting payment history for ${userType}: ${userId}`);
        
        let whereClause = {};
        if (userType === 'Client') {
            whereClause = { payerId: userId };
        } else {
            whereClause = { receiverId: userId };
        }
        
        if (filters.status) {
            whereClause.paymentStatus = filters.status;
        }
        
        if (filters.type) {
            whereClause.paymentMethod = { [require('sequelize').Op.like]: `%${filters.type}%` };
        }
        
        if (filters.dateFrom || filters.dateTo) {
            whereClause.createdAt = {};
            if (filters.dateFrom) {
                whereClause.createdAt[require('sequelize').Op.gte] = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                whereClause.createdAt[require('sequelize').Op.lte] = new Date(filters.dateTo + 'T23:59:59.999Z');
            }
        }
        
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        
        console.log('Querying payment history with filters:', whereClause);
        
        const { count, rows: payments } = await Payment.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: require('../../../models/users'),
                    as: 'payer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: require('../../../models/users'),
                    as: 'receiver',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });
        
        const formattedPayments = payments.map(payment => {
            const paymentData = {
                id: payment.id,
                amount: parseFloat(payment.amount),
                currency: 'NGN',
                status: payment.paymentStatus,
                description: payment.description,
                paymentMethod: payment.paymentMethod,
                transactionId: payment.transactionId,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                type: determinePaymentType(payment, userType),
                direction: determinePaymentDirection(payment, userType),
                counterparty: getCounterparty(payment, userType)
            };
            
            if (userType === 'runner' && payment.paymentStatus === 'Paid') {
                paymentData.walletImpact = calculateWalletImpact(payment);
            }
            
            return paymentData;
        });
        
        const summary = await getPaymentSummary(userId, userType, whereClause);
        
        console.log(`Retrieved ${formattedPayments.length} payment records`);
        console.log(`Total records: ${count}`);
        
        return {
            success: true,
            payments: formattedPayments,
            pagination: {
                total: count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (offset + limit) < count
            },
            summary: summary,
            filters: filters,
            message: `Payment history retrieved successfully for ${userType}`
        };
        
    } catch (error) {
        console.error('Error getting payment history:', error);
        throw new Error(`Failed to get payment history: ${error.message}`);
    }
};

const getPaymentSummary = async (userId, userType, whereClause) => {
    try {
        const totalPayments = await Payment.count({ where: whereClause });
        
        const statusCounts = await Payment.findAll({
            where: whereClause,
            attributes: [
                'paymentStatus',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['paymentStatus'],
            raw: true
        });
        
        const amountStats = await Payment.findAll({
            where: whereClause,
            attributes: [
                'paymentStatus',
                [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount']
            ],
            group: ['paymentStatus'],
            raw: true
        });
        
        const summary = {
            totalPayments: totalPayments,
            statusBreakdown: {},
            amountBreakdown: {},
            totalAmount: 0
        };
        
        statusCounts.forEach(stat => {
            summary.statusBreakdown[stat.paymentStatus] = parseInt(stat.count);
        });
        
        amountStats.forEach(stat => {
            const amount = parseFloat(stat.totalAmount) || 0;
            summary.amountBreakdown[stat.paymentStatus] = amount;
            summary.totalAmount += amount;
        });
        
        if (userType === 'runner') {
            const wallet = await Wallet.findOne({ where: { runnerId: userId } });
            summary.currentWalletBalance = wallet ? parseFloat(wallet.balance) : 0;
        }
        
        return summary;
        
    } catch (error) {
        console.error('Error getting payment summary:', error);
        return {
            totalPayments: 0,
            statusBreakdown: {},
            amountBreakdown: {},
            totalAmount: 0
        };
    }
};

module.exports = {
    
    verifyPayment,
    topUpRunnerWallet,
    getRunnerWalletBalance,
    processRunnerWithdrawal,
    getPaymentHistory,
    getPaymentSummary
};
