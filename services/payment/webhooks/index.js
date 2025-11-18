const crypto = require('crypto');
const Payment = require('../../../models/payment');
const Wallet = require('../../../models/wallet');
const WalletTransaction = require('../../../models/wallettransaction');
const config = require('../config');
const { topUpRunnerWallet } = require('../core/payments');
const { sendPaymentNotifications, sendPayoutSuccessNotification, sendPayoutFailedNotification } = require('../notifications');

const handleWebhook = async (webhookData, signature) => {
    try {
        console.log(`Processing webhook notification...`);
        console.log(`Webhook data:`, JSON.stringify(webhookData, null, 2));
        
        if (!verifyWebhookSignature(webhookData, signature)) {
            throw new Error('Invalid webhook signature');
        }
        
        const { event, data } = webhookData;
        
        if (!event || !data) {
            throw new Error('Invalid webhook payload structure');
        }
        
        console.log(`Processing event: ${event}`);
        console.log(`Transaction data:`, JSON.stringify(data, null, 2));
        
        const payment = await Payment.findOne({
            where: { id: data.reference }
        });
        
        if (!payment) {
            console.error(`Payment not found for reference: ${data.reference}`);
            throw new Error(`Payment not found for reference: ${data.reference}`);
        }
        
        if (isWebhookAlreadyProcessed(payment, event, data)) {
            console.log(`Webhook already processed for payment: ${data.reference}`);
            return {
                success: true,
                message: 'Webhook already processed',
                paymentId: data.reference,
                status: 'duplicate'
            };
        }
        
        let result;
        
        if (event.includes('charge.success')) {
            result = await handleChargeSuccess(payment, data);
        } else if (event.includes('charge.failed')) {
            result = await handleChargeFailed(payment, data);
        } else if (event.includes('transfer.success')) {
            result = await handleTransferSuccess(payment, data);
        } else if (event.includes('transfer.failed')) {
            result = await handleTransferFailed(payment, data);
        } else if (event.includes('payout.success')) {
            result = await handlePayoutSuccess(payment, data);
        } else if (event.includes('payout.failed')) {
            result = await handlePayoutFailed(payment, data);
        } else if (event.includes('refund.success')) {
            result = await handleRefundSuccess(payment, data);
        } else if (event.includes('refund.failed')) {
            result = await handleRefundFailed(payment, data);
        } else {
            console.warn(`Unknown webhook event: ${event}`);
            result = {
                success: false,
                message: `Unknown webhook event: ${event}`,
                paymentId: data.reference,
                status: 'unknown_event'
            };
        }
        
        console.log(`Webhook processed successfully for payment: ${data.reference}`);
        
        return {
            success: true,
            message: 'Webhook processed successfully',
            paymentId: data.reference,
            event: event,
            status: data.status,
            result: result
        };
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        throw new Error(`Failed to process webhook: ${error.message}`);
    }
};

const verifyWebhookSignature = (webhookData, signature) => {
    try {
        if (!signature) {
            console.error('No webhook signature provided');
            return false;
        }
        
        const expectedSignature = crypto
            .createHmac('sha256', config.KORA_SECRET_KEY)
            .update(JSON.stringify(webhookData.data))
            .digest('hex');
        
        const isValid = signature === expectedSignature;
        
        if (!isValid) {
            console.error('Invalid webhook signature');
            console.error('Expected:', expectedSignature);
            console.error('Received:', signature);
        } else {
            console.log('Webhook signature verified successfully');
        }
        
        return isValid;
        
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
};

const isWebhookAlreadyProcessed = (payment, event, data) => {
    const webhookStatus = data.status === 'success' ? 'Paid' : 'Failed';
    const recentlyUpdated = new Date() - new Date(payment.updatedAt) < 60000;
    
    return payment.paymentStatus === webhookStatus && recentlyUpdated;
};

const handleChargeSuccess = async (payment, data) => {
    console.log(`Processing successful charge for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Paid',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    await confirmPayment(payment.id);
    
    await sendPaymentNotifications(payment, 'Paid', data);
    
    return {
        success: true,
        message: 'Charge success processed',
        paymentStatus: 'Paid',
        topUpResult: topUpResult
    };
};

const handleChargeFailed = async (payment, data) => {
    console.log(`Processing failed charge for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Failed',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    await sendPaymentNotifications(payment, 'Failed', data);
    
    return {
        success: true,
        message: 'Charge failure processed',
        paymentStatus: 'Failed'
    };
};

const handleTransferSuccess = async (payment, data) => {
    console.log(`Processing successful transfer for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Paid',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    return {
        success: true,
        message: 'Transfer success processed',
        paymentStatus: 'Paid'
    };
};

const handleTransferFailed = async (payment, data) => {
    console.log(`Processing failed transfer for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Failed',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    return {
        success: true,
        message: 'Transfer failure processed',
        paymentStatus: 'Failed'
    };
};

const handlePayoutSuccess = async (payment, data) => {
    console.log(`Processing successful payout for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Paid',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    const walletTransaction = await WalletTransaction.findOne({
        where: { reference: payment.id }
    });
    
    if (walletTransaction) {
        await walletTransaction.update({
            status: 'completed',
            updatedAt: new Date()
        });
    }
    
    await sendPayoutSuccessNotification(payment, data);
    
    return {
        success: true,
        message: 'Payout success processed',
        paymentStatus: 'Paid'
    };
};

const handlePayoutFailed = async (payment, data) => {
    console.log(`Processing failed payout for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Failed',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    const walletTransaction = await WalletTransaction.findOne({
        where: { reference: payment.id }
    });
    
    if (walletTransaction) {
        await walletTransaction.update({
            status: 'failed',
            updatedAt: new Date()
        });
        
        const wallet = await Wallet.findOne({
            where: { id: walletTransaction.walletId }
        });
        
        if (wallet) {
            const refundAmount = parseFloat(walletTransaction.amount);
            const currentBalance = parseFloat(wallet.balance);
            const newBalance = currentBalance + refundAmount;
            
            await wallet.update({
                balance: newBalance,
                lastTransactionAt: new Date()
            });
            
            await WalletTransaction.create({
                walletId: wallet.id,
                amount: refundAmount,
                type: 'credit',
                description: `Refund for failed payout - ${payment.id}`,
                reference: `REF_${payment.id}`,
                status: 'completed',
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
                metadata: {
                    originalTransaction: payment.id,
                    refundReason: 'Payout failed',
                    koraResponse: data
                }
            });
            
            console.log(`Refunded ${refundAmount} NGN back to runner wallet`);
        }
    }
    
    await sendPayoutFailedNotification(payment, data);
    
    return {
        success: true,
        message: 'Payout failure processed',
        paymentStatus: 'Failed'
    };
};

const handleRefundSuccess = async (payment, data) => {
    console.log(`Processing successful refund for payment: ${payment.id}`);
    
    await Payment.update(
        {
            paymentStatus: 'Refunded',
            transactionId: data.reference,
            updatedAt: new Date()
        },
        { where: { id: payment.id } }
    );
    
    return {
        success: true,
        message: 'Refund success processed',
        paymentStatus: 'Refunded'
    };
};

const handleRefundFailed = async (payment, data) => {
    console.log(`Processing failed refund for payment: ${payment.id}`);
    
    return {
        success: true,
        message: 'Refund failure processed',
        paymentStatus: payment.paymentStatus
    };
};

module.exports = {
    handleWebhook,
    verifyWebhookSignature,
    isWebhookAlreadyProcessed,
    handleChargeSuccess,
    handleChargeFailed,
    handleTransferSuccess,
    handleTransferFailed,
    handlePayoutSuccess,
    handlePayoutFailed,
    handleRefundSuccess,
    handleRefundFailed
};
