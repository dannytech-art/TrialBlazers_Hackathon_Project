
const axios = require('axios')

const paymentMethod = require('../models/payment')
const user = require('../models/users')





require('dotenv').config();

exports.initializePayment = async (req,res) => {
    try {
        const {payerId, receiverId, amount, description, paymentMethod} = req.body;

        const payer = await user.findByPK(payerId)

        const receiver = await user.findByPk(receiverId)
        if(!payer || !receiver) {
            return res.status(404).json({
                message:'invalid payer or reciever'
            })
        }

        const payment  = await paymentMethod.create({
            payerId,
            receiverId,
            amount,
            description,
            paymentMethod,
            paymentStatus: 'pending'
        });

        const response  = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize    ',
            {
               reference:payment.id,
               amount,
               currency: 'NGN',
               narration: description || 'payment transaction',
               customer:{
                name: payer.fullName || 'Anonymous User',
                email: payer.email
               } ,
               notification_url:`${process.env.BASE_URL}/api/payment/webhook`,
            },
            {
                headers:{
                    Authorization:`Bearer ${process.env.KORA_SECRET_KEY}`,
                    'content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({
            message:'Payment initialized successfully',
            data:{
                payment,
                checkOutUrl:response.data.data.checkout_url,
                reference:payment.id
            }
        })
    } catch (error) {
        res.status(500).json({
            message:`internal server error from initalize payment `,
            error:error.message
        })
    }
};

exports.verifyPayment = async (req,res) => {
    try {
        const {reference} = req.params;

        const payment = await paymentMethod.findByPk(reference);
        if (!payment){
            return res.status(404).json({
                message:'payment not found'
            })
        }
        const response = await axios.get(`https://api.korapay.com/merchant/api/v1/transactions/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
                    
                }
            }
        );
        const status = response.data.data.status;

        if (status === 'success' || status === 'successful') {
        payment.paymentStatus = 'Paid';
        } else if (status === 'failed') {
        payment.paymentStatus = 'Failed';
        } else {
        payment.paymentStatus = 'Pending';
        }

        await payment.save();

        return res.status(200).json({
            message:'payment verification complete',
            data:{
                payment,
                koraStatus:status
            }
        })

        
    } catch (error) {
        res.status(500).json({
            message:`internal server error from verify payment`,
            error:error.payment
        })
    }
}

exports.getAllPayments = async (req,res) => {
    try {
        const {createdAt} = req.body;
        const payments = await paymentMethod.findAll({
            order:[['createdAt','DESC']]
        })

        res.status(200).json({
            message:'All payments retrieved successfully',
            data:payments
        })
        
    } catch (error) {
        res.status(500).json({
            message:`internal server error from all payments`,
            error:error.message
        })
    }
}

exports.getOnePayment = async (req,res) => {
    try {
        const {id} =req.params;
        const payment = await paymentMethod.findByPk(id);
        if (!payment){
            return res.status(404).json({
                message:'payment not found'
            })
        }

        res.status(200).json({
            message:`payment recieved successfully`,
            data:payment
        })
    } catch (error) {
        res.status(500).json({
            message:`internal server error from one payment`,
            error:error.message
        })
    }
}

exports.webhook = async (req,res) => {
    try {
        const {event, data} = req.body;
        const reference =data.reference;
        const status = data.status;

        const payment = await paymentMethod.findByPk(reference)

        if(!payment) {
            return res.status(404).json({
                message:`payment not found for this reference`,

            })
        }
        if (status === 'success' || status === 'successful') {
        payment.paymentStatus = 'Paid';
        const runner = await user.findByPk(payment.receiverId)
        const commission =  process.env.ERRANDHIVE_COMMISSION

        const amount = payment.amount

        const runnerUpdatedWallet =  amount * (1- commision)


        runner.wallet += runnerUpdatedWallet

        

        } else if (status === 'failed') {
        payment.paymentStatus = 'Failed';
        } else {
        payment.paymentStatus = 'Pending';
        }


    res.status(200).json({
        message:`webhook proccessed succesfully`
    })

    } catch (error) {
        res.status(500).json({
            message:`internal server error on webhook`,
            error:error.message
        })
    }
}






