const Admin = require("../models/admin");
const userModel = require("../models/users");
const jwt = require ('jsonwebtoken');

exports.authenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Invalid token provided'
            })
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await userModel.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
            }
      req.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError){
            return res.status(401).json({
                message: "Session expired, please login again"
            })   
        }
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};

exports.isAdmin =  async (req, res,next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Invalid token provided'
            })
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const admin = await Admin.findByPk(decoded.id);

        if (!admin) {
            return res.status(401).json({ message: 'You are not authorized to perform this action!' });
            }
      req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };

    next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError){
            return res.status(401).json({
                message: "Session expired, please login again"
            })   
        }
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        })
    }
};
