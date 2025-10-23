const { serve } = require("swagger-ui-express");
const loginModel = require("../models/loginModel");
const login = require("../models/loginModel")
const jwt = require('jsonwebtoken')

const Login = require("../models/loginModel");
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req,res) => {
    try {
        const {email, password} = req.body;
        const existingEmail = await loginModel.findOne({where: {email:email}})

        if (!existingEmail){
            return res.status(400).json({message: 'Email does not exist pls signUp'})
        }

        const hidePassword = await bcrypt.hash(password, 10);


        const user = await loginModel.create({
            email,
            password:hidePassword
        })

        res.status(200).json({
            message:'user registered successfully',
            data:user
        })

    
        
    } catch (error) {
        res.status(500).json({
            message:`internal server error`,
            error:error.message
        })
    }
}

exports.login = async (req,res) => {
    try {
        const {email, password } =req.body;

        const user = await loginModel.findOne({where: {email}})

        if (!user) {
            return res.status(404).josn({ message:'user not found '})

        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({
                message:'invalid password'
            })
        }
        const token = jwt.sign({ id: user.id, email: user.email}, JWT_SECRET, {expires: '2h'});

        res.status(200).json({
            message: 'Login successful',
            data: user,
            validPassword,
            token
        })


    } catch (error) {
        res.status(500).json({
            message:`internal for Login`,
            error:error.message
        })
    }
}
