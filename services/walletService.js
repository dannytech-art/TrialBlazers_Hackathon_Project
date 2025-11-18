const sequelize = require('../database/databases');
const Wallet = require('../models/wallet');
const WalletTransaction = require('../models/wallettransaction');

async function creditRunnerWallet(payment, t = null) {
  const useTransaction = !!t;
  const tx = t || await sequelize.transaction();

  try {
    // Find or Create wallet for the runner
    const [wallet] = await Wallet.findOrCreate({
      where: { runnerId: payment.receiverId },
      defaults: {
        runnerId: payment.receiverId,
        balance: 0.00,
        currency: 'NGN',
        isActive: true
      },
      transaction: tx,
      lock: tx.LOCK.UPDATE
    });

    const oldBalance = parseFloat(wallet.balance);
    const creditAmount = parseFloat(payment.amount);

    const newBalance = (oldBalance + creditAmount).toFixed(2);

    // Update wallet
    await wallet.update(
      {
        balance: newBalance,
        lastTransactionAt: new Date()
      },
      { transaction: tx }
    );

    // OPTIONAL: Save transaction log (recommended)
    await WalletTransaction.create(
      {
        walletId: wallet.id,
        amount: creditAmount,
        type: 'credit',
        description: `Payment ${payment.id} credited`,
        balanceBefore: oldBalance,
        balanceAfter: newBalance
      },
      { transaction: tx }
    );

    if (!useTransaction) await tx.commit();
    return wallet;

  } catch (err) {
    if (!useTransaction) await tx.rollback();
    throw err;
  }
}

module.exports = { creditRunnerWallet };
