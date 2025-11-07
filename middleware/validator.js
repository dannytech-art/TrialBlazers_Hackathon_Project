const Joi = require('joi');

exports.registerValidator = async(req, res, next)=> {
    const schema = Joi.object({
        firstName: Joi.string().trim().min(2).required().pattern(/^[A-Za-z]/).messages({
            'string.empty': 'Firstname is required',
            'string.min': 'Firstname must be more than 5 characters long',
            'string.pattern.base': 'Fullname can only contain letters',
        }),
        lastName: Joi.string().trim().min(2).required().pattern(/^[A-Za-z]/).messages({
            'string.empty': 'Lastname is required',
            'string.min': 'Lastname must be more than 5 characters long',
            'string.pattern.base': 'Fullname can only contain letters',
         }),
        email: Joi.string().email().lowercase().trim().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'string.lowercase': 'Email must be in lowercase'
        }),
        role: Joi.string().trim().required().pattern(/^[A-Za-z]/).messages({
            'string.empty': 'role is required'
         }),
        password: Joi.string().
        pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&]).{8,}$/).
        messages({
            'string.empty': 'Password is required',
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*_?&)'           
        }),
        confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
            'any.only': 'Confirm password must match password',
            'string.empty': 'Confirm password is required'
        }),
    })
    
    const {error} = schema.validate(req.body, {abortEarly: true})
        if(error){
            return res.status(400).json({
                message: 'Validation error: ' + error.message
            })
        }
        next();
},

exports.verifyValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    otp: Joi.string().trim().required().messages({
      'string.empty': 'OTP is required',
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }

  next();
};

exports.resendValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }
  next();
};
exports.postErrandValidator = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().required().messages({
      'string.empty': 'Title is required',
    }),
    description: Joi.string().trim().required().messages({
      'string.empty': 'Description is required',
    }),
    pickupAddress: Joi.string().trim().required().messages({
      'string.empty': 'Pickup address is required',
    }),
    deliveryAddress: Joi.string().trim().required().messages({
      'string.empty': 'Delivery address is required',
    }),
    pickupContact: Joi.string().trim().required().messages({
      'string.empty': 'Pickup contact is required',
    }),
    price: Joi.number().positive().required().messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required',
    }),
    attachments: Joi.string().allow(null, '').optional(),
  });
  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }
  next();
};