// const Payment = require('../models/payment');
// const axios = require('axios');
// const cron = require('node-cron');


// exports.processMondayPayments = async (req, res) => {
//   try {
//     console.log(' Monday Payment Scheduler Started...');

//     const pendingPayments = await Payment.find({
//   where: { paymentStatus: 'Pending' }
//     });

//     if (!pendingPayments.length) {
//       if (res) {
//         return res.status(200).json({
//           success: true,
//           message: 'No pending payments to process.'
//         });
//       }
//       return;
//     }

//     const results = [];

//     for (const payment of pendingPayments) {
//       try {
//         const korapayResponse = await axios.post(
//           'https://api.korapay.com/merchant/api/v1/charges',
//           {
//             reference: payment.id,
//             amount: payment.amount,
//             currency: 'NGN',
//             narration: payment.description,
//             customer: {
//               name: 'Joseph',
//               email: 'obade@gmail.com'
//             }
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );
//         if (korapayResponse.data.status === 'success') {
//           await payment.update({ paymentStatus: 'Paid' });
//           results.push({
//             id: payment.id,
//             amount: payment.amount,
//             status: 'Paid',
//             message: 'Payment processed successfully'
//           });
//           console.log(` Payment ${payment.id} processed successfully.`);
//         } else {
//           await payment.update({ paymentStatus: 'Failed' });
//           results.push({
//             id: payment.id,
//             amount: payment.amount,
//             status: 'Failed',
//             message: 'Payment failed during KoraPay processing'
//           });
//           console.log(` Payment ${payment.id} failed.`);
//         }
//       } catch (err) {
//         console.error(`Error processing payment ${payment.id}:`, err.message);
//         results.push({
//           id: payment.id,
//           status: 'Error',
//           message: err.message
//         });
//       }
//     }

//     console.log('Monday Payment Scheduler completed.');

//     if (res) {
//       return res.status(200).json({
//         success: true,
//         message: 'Monday payments processed successfully.',
//         processedPayments: results
//       });
//     }

//   } catch (error) {
//     console.error('Error in Monday Payment Scheduler:', error.message);
//     if (res) {
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error in payment scheduler',
//         error: error.message
//       });
//     }
//   }
// };


// cron.schedule('0 8 * * 1', async () => {
//   console.log('Auto Scheduler Triggered: Monday 8:00 AM');
//   try {
//     await exports.processMondayPayments(); 
//     console.log('Automatic Monday Payment run completed.');
//   } catch (err) {
//     console.error(' Auto Scheduler failed:', err.message);
//   }
// });
