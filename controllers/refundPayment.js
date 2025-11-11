const axios = require('axios');
const refunds = require('../models/refundPayment');
const payments = require('../models/payment');
const Refund = require('../models/refundPayment');
const { Payment } = require('../models');

exports.initiateRefund = async (req,res) => {
    try {
        const {paymentId,amount,reason}= req.body;

        if(!paymentId){
            res.status(404).json({
                message:'payment Id is required'
            })
        }
        const payment  = await payments.findByPK(paymentId)
        if(!payment){
            return res.status(404).json({message: 'payment not found on the list'})
        }

        if(payment.paymentStatus !== 'paid'){
            return res.status(404).json({
                message:'only successfull payments can be refunded'
            })
        }

        const refundReference = `REF-${uuidv4()}`;

        const payload  = {
            payment_refrence: payment.transactionId,

            refrence: refundReference,
            amount: amount || payment.amount,
            reason:reason ,
        }

        const response =await axios.post('https://api.korapay.com/merchant/api/v1/refunds/initiate',
      payload,
    {
        headers:{
            'content-Type': 'application/json',
            Authorization: `Beare ${
            process.env.KORA_SECRET_KEY}`
        }
    })

    const refund = await refunds.create({
        paymentId:payment.id,
        refundReference,
        amount:payload.amount,
        reason:payload.reason,
        status:response.data?.data?.status|| 'processing',
        refundResponse:response.data,
    })
    if(response.data?.data?.status === 'success'){
        await payments.update({
            paymentStatus:'Refunded'
        })
    }
    return res.status(200).json({
        message:'Refund initiated successfully',
        data:refund
    })

        
    } catch (error) {

        console.log('refund error:', error.response?.data || error.message);
        
        res.status(500).json({
        message:'failed to initiate Refund',
        error:error.response?.data||error.message
        })
    }
}


exports.initiateRefunds = async (req,res) => {
    try {
        const{paymentId, amount, reason} = req.body;

        if(!paymentId){
            return res.status(400).json({
                message:'payment ID is  required'
            })
        }
        const payment  = await payments.findByPk(paymentId)
        if(!payment){
            return res.status(404).json({
                message:'payment not found in the system'
            })
        }
        if(payment.paymentStatus.toLowercase() !=='paid'){
            return res.status(404).json({
                message:'only successfull payment can be refunded'
            })
        }

        const refundReference = `REF-${uuidv4()}`;
        const refund = await Refund.create({
            paymentId:payment.id,
            refundReference,
            amount: amount || payment.amount,
            reason: reason || 'No reason provided',
            status: 'pending_admin_approval'
        })

        res.status(200).json({
            message: 'Refund requested submitted successfully. awaiting Admin Approval',
            data:refund
        });
    } catch (error) {
        res.status(500).json({
            message:'internal server error initiating refund',
            error:error.message
        })
    }
}



  
exports.verifyRefundByAdmin = async (req,res) => {
   try {
    const {refundId} = req.params;
    const adminUser = req.user;


    if(!adminUser || adminUser.role !== 'admin') {
        return res.status(404).json({
            message:'Access denied.Admin only'
        })

    }
    const refund = await Refund.findByPk(
        refundId
    )
    if(!refund){
        return res.status(404).json({
            message:'refund record not found '
        });
    }
    if (refund.status !== 'pending_admin_approval') {
        return res.status(400).json({
            message:'refund has already been processed or denied'
        })
    }

    const payment = await Payment.findByPk(refund.aymentId);
    if (!payment) {
        return res.status(400).json({
            message:'Associated payment not found'
        })
    }

    const payload = {
        paymen_reference : payment.transactionId,
        refrence: refund.refundReference,
        amount:refund.amount,
        reason: refund.reason,
    }
     const response =await axios.post('https://api.korapay.com/merchant/api/v1/refunds/initiate',
      payload,
    {
        headers:{
            'content-Type': 'application/json',
            Authorization: `Beare ${
            process.env.KORA_SECRET_KEY}`
        }
    })
    refund.status = response.data?.data?.status|| 'processing';
    refund.refundResponse = response.data;

    refund.verifiedBy = adminUser.id;
    await  refund.save();

    if(response.data?.data?.status === 'success'){
        payment.paymentStatus = 'Refunded';
        await payment.save();
    }
    res.status(200).json({
        message:'Refund verified and processed successfully by admin',
        data:refund
    })


    
   } catch (error) {
    console.log('Admin refund verification error', error.message);
    
    res.status(500).json({
        message:'internal server error from the verifyRefundByAdmin',
        error:error.message
    })
   } 
}