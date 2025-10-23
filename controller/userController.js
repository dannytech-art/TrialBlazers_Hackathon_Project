const userModel = require('../models/users');

const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { sendMail } = require("../middleware/email");
const { html } = require("../middleware/signUp");
const jwt = require('jsonwebtoken');
const { forgotHtml } = require("../middleware/forgot");
// const { sendingMail } = require("../middleware/mailgun");
const axios = require('axios');
const { where } = require('sequelize');

const generateToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET_KEY, {expiresIn: '1d'})
}


exports.registerClient = async (req, res) => {
    try {
    req.body.role = "Client";
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;
        const existingEmail = await userModel.findOne({ email: email.toLowerCase() });
        const existingPhoneNumber = await userModel.findOne({ phoneNumber: phoneNumber });

        if(existingEmail || existingPhoneNumber) {
            return res.status(400).json({
                messasge: 'User already exists'
            })
        }

        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltRound);
        const otp = Math.round(Math.random() * 1e6).toString().padStart(6, '0')

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            age,
            phoneNumber,
            otp: otp,
            otpExpiredAt: Date.now() + 1000 * 120
        });

        const details = {
            email:user.email,
            subject: 'Email Verification',
            html: html(user.otp, `${user.fullName.split(' ')[0]}`)
        }
        await sendMail(details)

        const subject = "Kindly Verify Your Email";
        
        await sendMail({
            to: email,
            subject,
            // text,
            html: html(link, user.lastName.split(' ')[1])
        }).then(() => {
            console.log("Mail sent");
        }).catch((e) => {
            console.log(e);
        })

        res.status(201).json({
            message: "User created successfully",
            verify_account: `Click on Verification link sent to ${user.email}`,
            data: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};

exports.registerRunner = async (req, res) => {
    try {
    req.body.role = "Runner";
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;
        const existingEmail = await userModel.findOne({ email: email.toLowerCase() });
        const existingPhoneNumber = await userModel.findOne({ phoneNumber: phoneNumber });

        if(existingEmail || existingPhoneNumber) {
            return res.status(400).json({
                messasge: 'User already exists'
            })
        }

        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltRound);
        const otp = Math.round(Math.random() * 1e6).toString().padStart(6, '0')

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            age,
            phoneNumber,
            otp: otp,
            otpExpiredAt: Date.now() + 1000 * 120
        });

        // const details = {
        //     email:user.email,
        //     subject: 'Email Verification',
        //     html: html(user.otp, `${user.fullName.split(' ')[0]}`)
        // }
        // await sendMail(details)

        const subject = "Kindly Verify Your Email";
        await sendMail({
            to: email,
            subject,
            // text,
            html: html(link, user.lastName.split(' ')[1])
        }).then(() => {
            console.log("Mail sent");
        }).catch((e) => {
            console.log(e);
        })

        res.status(201).json({
            message: "User created successfully",
            verify_account: `Click on Verification link sent to ${user.email}`,
            data: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};


exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const checkUser = await userModel.findByPk(id, {where: {isVerified: true}})
        if (!checkUser) {
            return res.status(404).json({ message: "User not found" })
        }

        if (checkUser.isVerified) {
            return res.status(400).json({
                message: 'Email already verified'
            })
        }
        re.status(200).json({
            message: "Email successfully verified"
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })

    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const checkUser = await userModel.findOne({email: email.toLowerCase().trim()});
        const checkPassword = await bcrypt.compare(password, checkUser.password)
        if(!checkUser || !checkPassword){
            return res.status(400).json({message: "Invalid credentials"});
        }
        if (checkUser.isVerified === false){
            return res.status(400).json({
                message: `This email ${checkUser.email} is not verified yet`
            })
        }
        const token = jwt.sign({id: checkUser._id}, "secretKey", {expiresIn: "2m"});
        res.status(200).json({
            message: 'Login successful',
            data: checkUser,
            token
        })
    } catch (error) {
        
       console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        }) 
    }
};

exports.home = async (req, res) => {
    try {
        const checkToken = req.headers.authorization;
        if(!checkToken) {
            return res.status(400).json({message: "Login required"})
        };
        
        const token = req.headers.authorization.split(" ")[1];
        
        jwt.verify(token, "secretKey", async(err, result)=>{
        
            if(err){
                res.status(400).json({error: err.message})
            } else{
                const checkcUser = await userModel.findById(result.id)
                res.status(200).json({message: `Welcome ${checkcUser.fullName}, we are happy to have you here`});
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })         
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const checkEmail = await userModel.findOne({email: email.toLowerCase().trim()});
        // if no email found, return the error message
        if(!checkEmail){
            return res.status(400).json({
                message: 'Invalid email provided'})
        };
        // Define the email subject
        const subject = 'Reset password';
        // Generate reset token  that expires in 1 day
        const token = jwt.sign({id: checkEmail._id}, "flyover", {expiresIn: "1d"});
        // Save reset token to database for the user
        await userModel.findByIdAndUpdate(checkEmail._id, {token});
        // Create a password reset link with the user's id
        const link = `${req.protocol}://${req.get('host')}/api/v1/reset/${checkEmail._id}`;
        // Send reset email using helper function
        await sendMail({
            to: email,
            subject,
            // text,
            html: forgotHtml(link, checkEmail.fullName)
        });
        // Respond success message
        res.status(200).json({
            message: 'Kindly check your email for instructions'
        })
    } catch (error) {
        // Handles any unexpected server error
        console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })  
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // Extract the new and confirm password from the request body
        const {newPassword, confirmPassword} = req.body;
        // An if statement to check if both passwords match
        if(newPassword !== confirmPassword) {
            return res.status(400).json({messsage: "Password does not match"})
        };
        // Generate salt for hashing password
        const saltRound = await bcrypt.genSalt(10);
        // Hash the new password
        const hash = await bcrypt.hash(confirmPassword, saltRound);
        // Find user by Id from the request params
        const user = await userModel.findById(req.params.id);
        console.log(user);
        // Verify reset token that was stored in the DB
        jwt.verify(user.token, "flyover", async (err, result)=>{
            if(err){ // If the token expired
                console.log(err)
                res.status(400).json({
                    message: "Email expired"
                })
            }else { // Update password in the DB and clear the token
                await userModel.findByIdAndUpdate(result.id, {password: hash, token: null}, {new: true});
                // Send a success response
                res.status(200).json({
                    message: "Password successfully changed"
                })
            }
        })
    } catch (error) {
        // Handles any unexpected server error
        console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })  
    }
};

exports.changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmPassword} = req.body;
        // if (!oldPassword || !newPassword || !confirmPassword) {
        //   return res.status(400).json({
        //         message: "All fields are required"
        //     })
        // }
        const id = req.user;
        console.log(id);
        
        const user = await userModel.findByPk(id);
        const checkPassword = await bcrypt.compare(oldPassword, user.password);
        if(!checkPassword){
            return res.status(400).json({
                message: "Password does not match your current password"
            })
        }
        const checkExistingPass = await bcrypt.compare(newPassword, user.password);
        if (checkExistingPass){
            return res.status(400).json({
                message: "You cannot use your previous password"
            })
        }
        if (confirmPassword !== newPassword) {
            res.status(400).json({
                message: "New passwords must match"
            })
        } else {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(confirmPassword, salt);
        // await userModel.findByIdAndUpdate(id, {password: hashPassword}, {new: true});
        res.status(200).json({
            message: "Password successfully changed"
        })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.getOneUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findByPk(userId).select('-password -otp -otpExpiredAt -__v');
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const allUsers = await userModel.findAll().select('-password -otp -otpExpiredAt');
        if (allUsers < 1) {
             res.status(200).json({
                message: `User's database is empty`
            })
        } else {
            res.status(200).json({
                message: `All users present in the database are ${allUsers.length}`,
                data: allUsers
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

exports.update = async (req, res) => {
    try {
        const { fullName, age } = req.body;
        const { id } = req.params;
        const file = req.file;
        let response;
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        };

        if (file && file.path) {
            await cloudinary.uploader.upload(file.path)
            fs.unlinkSync(file.path)
        }
        const userData = {
            fullName: fullName ?? user.fullName,
            age: age ?? user.age,
            profiePicture: {
                imageUrl: response?.secure_url,
                publicId: response?.public_id
            }
        };
        const newData = Object.assign(user, userData);
        const update = await userModel.findByIdAndUpdate(user._id, newData, { new: true });
        res.status(200).json({
            message: 'User updated successfully',
            data: update
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await userModel.findById(id);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        await userModel.destroy({where: {id}});
        res.status(200).json({
            message: 'User deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.makeAdmin = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await userModel.findById(id);
        if (user === null) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        user.isAdmin = true;
        await user.save();
        res.status(200).json({
            message: "User role updated to Admin"
        });
        } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.googleAuthLogin = async (req, res) => {
    try {
        const token = await jwt.sign({
            id: req.user.id,
            email: req.user.email,
            isAdmin: req.user.isAdmin
        }, "secretKey", {expiresIn: "1hr"})
        // res.redirect('/')

        res.status(200).json({
            message: 'Login successful',
            data: req.user.fullName,
            token
        })
    } catch (error) {
        res.status(500).json({
            message: "Error logging with Google: " + error.message
        })
    }
}