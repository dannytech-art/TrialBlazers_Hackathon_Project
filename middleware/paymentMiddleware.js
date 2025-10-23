const {payment}= require ('../models');
const paymentModel = require('../models/payment');

exports.checkPaymentExists = async (req,res) => {
    try {
        const {refrence} =register.body;

        const payment = await  paymentModel.findOne({
            where: {refrence}
        })

        if(!payment){
            return res.status(401).json({
                message:'payment record not found'
            })
        }

        req.payment = payment;next();


    } catch (error) {
        res.status(500).json({
            message:`internal server error for check payment existence`,
            error:error.message
        })
    }
}