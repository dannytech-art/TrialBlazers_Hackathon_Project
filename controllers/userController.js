const userModel = require('../models/users');
const passport = require('passport');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { sendMail } = require("../middleware/email");
const jwt = require('jsonwebtoken');
const { registerOTP } = require('../utils/otpMail');
const { forgotHtml } = require('../middleware/forgotMail');
const { generateToken, toTitleCase } = require('../utils/extras');


exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;
        const existingEmail = await userModel.findOne({email: email.toLowerCase().trim()});

        if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
        }

        if(existingEmail) {
            return res.status(400).json({
                messasge: 'Email already registered'
            })
        }

        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltRound);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        let firstNameCase = toTitleCase(firstName);
        let lastNameCase = toTitleCase(lastName);

        const user = await userModel.create({
            firstName: firstNameCase,
            lastName: lastNameCase,
            email: email.toLowerCase().trim(),
            password: hashPassword,
            role,
            otp: otp,
            otpExpiredAt: Date.now() + 1000 * 300
        });
       
        const subject = "Email Verification";
        await sendMail(user.email, subject, registerOTP(user.otp, user.firstName));

        const token = generateToken(user.id, user.role);

        const newUser = {
            firstNameCase,
            lastNameCase,
            email: email.toLowerCase().trim(),
            role,
            token
        }
        res.status(201).json({
            message: "User registered successfully",
            verify_account: `Enter the OTP sent to ${user.email} for Email verification`,
            data: newUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await userModel.findOne({email: email.toLowerCase().trim()});

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    if (Date.now() > new Date(user.otpExpiredAt).getTime()) {
        return res.status(400).json({
        message: "OTP expired",
      });
    }

   if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
   }

   user.isVerified = true;
   user.otp = null;
   user.otpExpiredAt = null;

    await user.save()

    res.status(200).json({
      message: "User verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      mesaage: "Error verifying user" + error.message,
    });
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiredAt = Date.now() + 1000 * 300
    
    await user.save();

    const subject = "Email Verification Code Resent";
     await sendMail(email, subject, registerOTP(otp, user.firstName));

    res.status(200).json({
    message: "OTP resent successfully, kindly check your email",
        });
  } catch (error) {
    res.status(500).json({
      mesaage: "Error resending OTP: " + error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkUser = await userModel.findOne({ email: email.toLowerCase().trim() });
    
    if (!checkUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!checkUser.isVerified) {
      return res.status(400).json({
        message: `This email ${checkUser.email} is not verified yet`,
      });
    };

     const token = jwt.sign(
      { id: checkUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const newUser = {
      id: checkUser._id,
      firstName: checkUser.firstName,
      lastName: checkUser.lastName,
      email: checkUser.email,
      role: checkUser.role,
      profileImage: checkUser.profileImage,
      bio: checkUser.bio,
      kycStatus: checkUser.kycStatus,
      isVerified: checkUser.isVerified,
      rating: checkUser.rating,
      totalJobs: checkUser.totalJobs,
      isActive: checkUser.isActive,
      createdAt: checkUser.createdAt,
      updatedAt: checkUser.updatedAt,
      token: token
    };

   
    res.status(200).json({
      message: "Login successful",
      data: newUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const checkEmail = await userModel.findOne( {email: email.toLowerCase().trim()});
      
        if(!checkEmail){
            return res.status(400).json({
                message: 'Invalid email address provided'})
        };
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        checkEmail.otp = otp;
        checkEmail.otpExpiredAt = Date.now() + 1000 * 300 

         await checkEmail.save();

        const subject = 'Reset Password';
        await sendMail(checkEmail.email, subject, forgotHtml(otp, checkEmail.firstName));
        res.status(200).json({
            message: 'Kindly check your email for instructions'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })  
    }
};

exports.verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const user = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (Date.now() > new Date(user.otpExpiredAt).getTime())
      return res.status(400).json({ message: 'OTP expired' });

    if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
   }
    user.otpVerified = true;
    user.otp = null;
    user.otpExpiredAt = null;

    await user.save();

    res.status(200).json({ message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP: ' + error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await userModel.findOne({
      email: email.toLowerCase().trim(),
      otpVerified: true
    }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found or OTP not verified" });
    }

    // Hash new password
    const saltRound = await bcrypt.genSalt(10);
    const hashedPW = await bcrypt.hash(newPassword, saltRound);

    user.password = hashedPW;
    user.otp = null;
    user.otpVerified = false;
    user.otpExpiredAt = null;

    await user.save(); 

    return res.status(200).json({
      message: "Password reset successful"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: "Error resetting password: " + error.message
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const id = req.user.id;

    // Mongoose: find user by ID
    const user = await userModel.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate old password
    const validOld = await bcrypt.compare(oldPassword, user.password);
    if (!validOld) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Prevent reusing old password
    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res.status(400).json({ message: "You cannot reuse your previous password" });
    }

    // Check confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords must match" });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();  // Mongoose save()

    res.status(200).json({ message: "Password successfully changed" });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getOneUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await userModel.findById(userId).select("-password -otp -otpExpiredAt -otpVerified");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            data: user
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


exports.getAll = async (req, res) => {
  try {
    const allUsers = await userModel.find().select("-password -otp -otpExpiredAt -otpVerified");
    if (allUsers.length < 1) {
      return res.status(200).json({
        message: "User's database is empty"
      });
    }
    res.status(200).json({
      message: `All users present in the database are ${allUsers.length}`,
      data: allUsers
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const id = req.user.id;
    const file = req.file;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let image = user.profileImage;

    if (file && file.path) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'user_profiles',
        public_id: `${id}-${Date.now()}`,
        overwrite: true,
      });
      fs.unlinkSync(file.path); 

      image = {
        publicId: result.public_id,
        url: result.secure_url,
      };
    }
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.profileImage = image || user.profileImage;
      user.bio = bio || null;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedFields,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Mongoose: find user by ID
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        await userModel.findByIdAndDelete(id);

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


 exports.auth = (req,res,next)=>{
  const {role} = req.query;
  const state = Buffer.from(JSON.stringify({ role })).toString('base64')
    passport.authenticate("google", {scope: ['profile', 'email'],state})(req,res,next)

 }
 exports.user = (req, res, next) => {
  passport.authenticate("google", (err, data) => {
    if (err || !data) {
      return res.redirect("/api/v1/failure");
    }

    req.session.authData = data;

    return res.redirect("/api/v1/success");
  })(req, res, next);
};


exports.success = (req, res) => {
  const authData = req.session.authData;

  if (!authData) {
    return res.status(400).json({ message: "Token missing" });
  }

  res.status(200).json({
    message: "User authenticated successfully",
    token: authData.token,
    user: authData.user,
  });

  req.session.authData = null;
};


exports.failure = (req, res) => {
  res.status(401).json({ message: "Authentication failed. Please try again." });
};


  exports.failure = (req,res)=>{
    res.status(401).json({
      message:'something went wrong'
    })
  }