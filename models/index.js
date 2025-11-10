'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Remove the auto-loader section completely and use manual loading only

// Manual model loading for class-based models
const Admin = require('./admin');
const User = require('./users');
const Errand = require('./errand');
const KYC = require('./kyc');
const Message = require('./message');
const Payment = require('./payment');
const Review = require('./review');
const Wallet = require('./wallet');
const WalletTransaction = require('./wallettransaction');
const RunnerBankDetails = require('./runnerbankdetails');
const RunnerApplication = require('./runnerapplication');

// Register models
db.Admin = Admin;
db.User = User;
db.Errand = Errand;
db.KYC = KYC;
db.Message = Message;
db.Payment = Payment;
db.Review = Review;
db.Wallet = Wallet;
db.WalletTransaction = WalletTransaction;
db.RunnerBankDetails = RunnerBankDetails;
db.RunnerApplication = RunnerApplication;

//

// ---------- USERS & ERRANDS ----------
db.User.hasMany(db.Errand, { foreignKey: 'userId', as: 'postedErrands', onDelete: 'CASCADE', });
db.Errand.belongsTo(db.User, { foreignKey: 'userId', as: 'poster' });

// ---------- RUNNER APPLICATIONS ----------
db.User.hasMany(db.RunnerApplication, { foreignKey: 'runnerId', as: 'applications' });
db.RunnerApplication.belongsTo(db.User, { foreignKey: 'runnerId', as: 'runner' });
db.Errand.hasMany(db.RunnerApplication, { foreignKey: 'errandId', as: 'applications' });
db.RunnerApplication.belongsTo(db.Errand, { foreignKey: 'errandId', as: 'errand' });

// ---------- REVIEWS ----------
db.User.hasMany(db.Review, { foreignKey: 'reviewerId', as: 'reviewsGiven' });
db.Review.belongsTo(db.User, { foreignKey: 'reviewerId', as: 'reviewer' });
db.Errand.hasOne(db.Review, { foreignKey: 'errandId', as: 'review' });
db.Review.belongsTo(db.Errand, { foreignKey: 'errandId', as: 'errand' });

// ---------- WALLET & TRANSACTIONS ----------
db.User.hasOne(db.Wallet, { foreignKey: 'runnerId', as: 'wallet' });
db.Wallet.belongsTo(db.User, { foreignKey: 'runnerId', as: 'runner' });

db.Wallet.hasMany(db.WalletTransaction, { foreignKey: 'walletId', as: 'transactions' });
db.WalletTransaction.belongsTo(db.Wallet, { foreignKey: 'walletId', as: 'wallet' });

// ---------- KYC ----------
db.User.hasOne(db.KYC, { foreignKey: 'userId', as: 'kyc' });
db.KYC.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

//  Link reviewer (admin) who reviewed KYC
db.User.hasMany(db.KYC, { foreignKey: 'reviewedBy', as: 'reviewedKYCs' });
db.KYC.belongsTo(db.User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// ---------- PAYMENTS ----------
db.Payment.belongsTo(db.User, { foreignKey: 'payerId', as: 'payer' });
db.Payment.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });
db.User.hasMany(db.Payment, { foreignKey: 'payerId', as: 'paymentsMade' });
db.User.hasMany(db.Payment, { foreignKey: 'receiverId', as: 'paymentsReceived' });

// ---------- RUNNER BANK DETAILS ----------
db.User.hasOne(db.RunnerBankDetails, { foreignKey: 'runnerId', as: 'bankDetails' });
db.RunnerBankDetails.belongsTo(db.User, { foreignKey: 'runnerId', as: 'runner' });

// ---------- ERRAND - PAYMENT (optional, if tied to an errand) ----------
db.Errand.hasOne(db.Payment, { foreignKey: 'errandId', as: 'payment' });
db.Payment.belongsTo(db.Errand, { foreignKey: 'errandId', as: 'errand' });

// ---------- MESSAGES ----------
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages' });
db.User.hasMany(db.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Message.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });
//
// Export
//
db.sequelize = sequelize;


module.exports = db;
