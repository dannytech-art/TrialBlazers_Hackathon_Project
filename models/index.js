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

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

const modelDefiners = [
  require('./users'),
  require('./errand'),
  require('./kyc'),
  require('./message'),
  require('./payment'),
  require('./review'),
  require('./wallet'),
  require('./wallettransaction'),
  require('./runnerbankdetails'),
  require('./runnerapplication')
];

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

const {User, Errand, RunnerApplication, Review, Payment, Wallet, WalletTransaction, RunnerBankDetails} = sequelize.models; 

User.hasMany(Errand, {foreignKey: 'userId'})
User.hasMany(RunnerApplication, {foreignKey: 'runnerId'});
User.hasMany(Review, {foreignKey: 'reviewerId'});
User.hasMany(Payment, {foreignKey: 'userId'})
User.hasOne(Wallet, { as: 'wallet', foreignKey: 'runnerId' });
User.hasMany(Payment, { as: 'paymentsMade', foreignKey: 'payerId' });
User.hasMany(Payment, { as: 'paymentsReceived', foreignKey: 'receiverId' });
User.hasOne(RunnerBankDetails, { as: 'bankDetails', foreignKey: 'runnerId' });

Errand.belongsTo(User, {foreignKey: 'userId', as: 'poster'});
Errand.hasMany(RunnerApplication, {foreignKey: 'errandId'});
Errand.hasOne(Payment, {foreignKey: 'errandId'});
Errand.hasOne(Review, {foreignKey: 'errandId'});

Payment.belongsTo(User, { as: 'payer', foreignKey: 'payerId' });
Payment.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

Wallet.hasMany(WalletTransaction, { as: 'transactions', foreignKey: 'walletId' });
Wallet.belongsTo(User, { as: 'runner', foreignKey: 'runnerId' });

WalletTransaction.belongsTo(Wallet, { as: 'wallet', foreignKey: 'walletId' });

RunnerBankDetails.belongsTo(User, { as: 'runner', foreignKey: 'runnerId' });
