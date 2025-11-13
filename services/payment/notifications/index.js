const { sendMail } = require('../../../middleware/email');
const { paymentSuccessHtml, walletTopUpHtml, paymentFailedHtml } = require('./paymentNotifyMail');
const Wallet = require('../../../models/wallet');

const sendPaymentNotifications = async (payment, status, transactionData) => {
    try {
        console.log(`Sending payment notifications for payment: ${payment.id}`);
        console.log(`Payment status: ${status}`);
        
        const [client, runner] = await Promise.all([
            require('../../../models/users').findOne({ where: { id: payment.payerId } }),
            require('../../../models/users').findOne({ where: { id: payment.receiverId } })
        ]);
        
        if (!client) {
            console.error(`Client not found for payment: ${payment.id}`);
            return;
        }
        
        if (!runner) {
            console.error(`Runner not found for payment: ${payment.id}`);
            return;
        }
        
        const amount = payment.amount;
        const currency = 'NGN';
        const transactionId = payment.transactionId || payment.id;
        const description = payment.description || 'Payment transaction';
        
        if (status === 'Paid') {
            await sendPaymentSuccessEmail(client, amount, currency, transactionId, description);
            await sendWalletTopUpEmail(runner, payment, amount, currency, transactionId, description);
            console.log(`Payment success notifications sent to client and runner`);
            
        } else if (status === 'Failed') {
            await sendPaymentFailedEmail(client, amount, currency, transactionId, description);
            console.log(`Payment failed notification sent to client`);
        }
        
    } catch (error) {
        console.error('Error sending payment notifications:', error);
    }
};

const sendPaymentSuccessEmail = async (client, amount, currency, transactionId, description) => {
    try {
        const subject = 'Payment Successful - ErrandHive';
        const htmlContent = paymentSuccessHtml(
            client.firstName,
            amount,
            currency,
            transactionId,
            description
        );
        
        await sendMail(client.email, subject, htmlContent);
        console.log(`Payment success email sent to client: ${client.email}`);
        
    } catch (error) {
        console.error('Error sending payment success email:', error);
    }
};

const sendWalletTopUpEmail = async (runner, payment, amount, currency, transactionId, description) => {
    try {
        const runnerWallet = await Wallet.findOne({
            where: { runnerId: runner.id }
        });
        
        const currentBalance = runnerWallet ? parseFloat(runnerWallet.balance) : 0;
        
        const subject = 'Wallet Topped Up - ErrandHive';
        const htmlContent = walletTopUpHtml(
            runner.firstName,
            amount,
            currency,
            currentBalance,
            transactionId,
            description
        );
        
    await sendMail(runner.email, subject, htmlContent);
        console.log(`Wallet top-up email sent to runner: ${runner.email}`);
        
    } catch (error) {
        console.error('Error sending wallet top-up email:', error);
    }
};

const sendPaymentFailedEmail = async (client, amount, currency, transactionId, description) => {
    try {
        const subject = 'Payment Failed - ErrandHive';
        const htmlContent = paymentFailedHtml(
            client.firstName,
            amount,
            currency,
            transactionId,
            description
        );
        
        await sendMail(client.email, subject, htmlContent);
        console.log(`Payment failed email sent to client: ${client.email}`);
        
    } catch (error) {
        console.error('Error sending payment failed email:', error);
    }
};

const sendPayoutSuccessNotification = async (payment, data) => {
    try {
        const runner = await require('../../../models/users').findOne({
            where: { id: payment.payerId }
        });
        
        if (runner) {
            const subject = 'Payout Successful - ErrandHive';
            const htmlContent = generatePayoutSuccessEmailHtml(
                runner.firstName,
                payment.amount,
                'NGN',
                payment.id
            );
            
            await sendMail(runner.email, subject, htmlContent);
            console.log(`Payout success notification sent to runner: ${runner.email}`);
        }
        
    } catch (error) {
        console.error('Error sending payout success notification:', error);
    }
};

const sendPayoutFailedNotification = async (payment, data) => {
    try {
        const runner = await require('../../../models/users').findOne({
            where: { id: payment.payerId }
        });
        
        if (runner) {
            const subject = 'Payout Failed - ErrandHive';
            const htmlContent = generatePayoutFailedEmailHtml(
                runner.firstName,
                payment.amount,
                'NGN',
                payment.id
            );
            
            await sendMail(runner.email, subject, htmlContent);
            console.log(`Payout failed notification sent to runner: ${runner.email}`);
        }
        
    } catch (error) {
        console.error('Error sending payout failed notification:', error);
    }
};

const generatePayoutSuccessEmailHtml = (firstName, amount, currency, transactionId) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Payout Successful - ErrandHive</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745;">Payout Successful!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2>Hi ${firstName},</h2>
            <p>Great news! Your payout has been processed successfully.</p>
            <p><strong>Amount:</strong> ${currency} ${amount}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Status:</strong> <span style="color: #28a745;">Completed</span></p>
            <p>The funds should reflect in your bank account within 1-3 business days.</p>
        </div>
        <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for choosing ErrandHive!</p>
        </div>
    </body>
    </html>
    `;
};

const generatePayoutFailedEmailHtml = (firstName, amount, currency, transactionId) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Payout Failed - ErrandHive</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545;">Payout Failed</h1>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2>Hi ${firstName},</h2>
            <p>We're sorry, but your payout could not be processed at this time.</p>
            <p><strong>Amount:</strong> ${currency} ${amount}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Status:</strong> <span style="color: #dc3545;">Failed</span></p>
            <p>The amount has been refunded back to your wallet balance.</p>
            <p>Please contact our support team if you need assistance or want to try again.</p>
        </div>
        <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Thank you for choosing ErrandHive!</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    sendPaymentNotifications,
    sendPaymentSuccessEmail,
    sendWalletTopUpEmail,
    sendPaymentFailedEmail,
    sendPayoutSuccessNotification,
    sendPayoutFailedNotification,
    generatePayoutSuccessEmailHtml,
    generatePayoutFailedEmailHtml
};
