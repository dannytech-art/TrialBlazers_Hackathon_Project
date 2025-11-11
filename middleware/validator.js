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
    title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .pattern(/^[A-Za-z0-9\s.,'-]+$/)
      .required()
      .messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters long',
        'string.pattern.base': 'Title can only contain letters, numbers, spaces, and punctuation',
      }),

    description: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least a characters long',
      }),

    pickupAddress: Joi.string()
      .trim()
      .min(5)
      .pattern(/^(?!\d+$)[A-Za-z0-9\s,.'-]+$/)
      .required()
      .messages({
        'string.empty': 'Pickup address is required',
        'string.pattern.base': 'Pickup address cannot contain only numbers',
      }),

    deliveryAddress: Joi.string()
      .trim()
      .min(5)
      .pattern(/^(?!\d+$)[A-Za-z0-9\s,.'-]+$/)
      .required()
      .messages({
        'string.empty': 'Delivery address is required',
        'string.pattern.base': 'Delivery address cannot contain only numbers',
      }),

    pickupContact: Joi.string()
      .trim()
      .pattern(/^\+?[0-9]{7,15}$/)
      .required()
      .messages({
        'string.empty': 'Pickup contact is required',
        'string.pattern.base': 'Pickup contact must be a valid phone number',
      }),

    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required',
      }),

    attachments: Joi.string()
      .uri()
      .allow(null, '')
      .optional()
      .messages({
        'string.uri': 'Attachments must be a valid URL',
      }),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message,
    });
  }

  next();
};
