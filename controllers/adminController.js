const adminModel = require('../models').Admin;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

exports.createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingAdmin = await Admin.findOne({where: {email: email.toLowerCase().trim()}});
        if (existingAdmin) {
            return res.status(400).json({message: `email ${email} already exist as an admin`});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin.create({
            email,
            password: hashedPassword
        });
        res.status(201).json({
            message: `Admin created successfully`,
            data: newAdmin
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal server error`,
            error: error.message,
        })
    }
}
exports.loginAdmin = async (req, res) => {
    try {
       const { email, password } = req.body;
       const admin = await Admin.findOne({where: {email: email.toLowerCase().trim()}});
         if (!admin) {
              return res.status(400).json({message: `Invalid credentials`});
            }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({message: `Invalid credentials`});
        }
        const token = jwt.sign(
            {
                id: admin.id,
                role: 'admin'
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );
        res.status(200).json({
            message: `Login successful`,
            data: {
                id: admin.id,
                email: admin.email,
                token
            }
        })
    } catch (error) {
        res.status(500).json({
            message: `Internal server error`,
            error: error.message,
        })
    }
}