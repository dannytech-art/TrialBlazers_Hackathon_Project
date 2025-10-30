const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './images')
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        const ext = file.mimetype.split('/')[1];
        cb(null, `IMG_${uniqueSuffix}.${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg, .jpeg, and .png files are allowed'), false);
    }
    cb(null, true);
  };

const limits = {
    fileSize: 1024 * 1024 * 20
}

const uploads = multer({
    storage,
    fileFilter,
    limits
})

module.exports = uploads;