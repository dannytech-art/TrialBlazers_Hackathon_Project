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

// Initialize models
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

// Define associations
db.User.hasMany(db.Errand, {foreignKey: 'userId'});
db.User.hasMany(db.RunnerApplication, {foreignKey: 'runnerId'});
db.User.hasMany(db.Review, {foreignKey: 'reviewerId'});

db.Errand.belongsTo(db.User, {foreignKey: 'userId', as: 'poster'});
db.Errand.hasMany(db.RunnerApplication, {foreignKey: 'errandId'});
db.Errand.hasOne(db.Payment, {foreignKey: 'errandId'});
db.Errand.hasOne(db.Review, {foreignKey: 'errandId'});

// Add more associations as needed
db.User.hasOne(db.Wallet, {foreignKey: 'runnerId'});
db.Wallet.belongsTo(db.User, {foreignKey: 'runnerId'});
db.Wallet.hasMany(db.WalletTransaction, {foreignKey: 'walletId'});
db.WalletTransaction.belongsTo(db.Wallet, {foreignKey: 'walletId'});

db.User.hasOne(db.KYC, {foreignKey: 'userId'});
db.KYC.belongsTo(db.User, {foreignKey: 'userId'});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

