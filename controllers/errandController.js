const Errand = require('../models/errand');
const User = require('../models/users');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.createErrand = async (req, res) => {
  try {

     console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const { title, description, pickupAddress, deliveryAddress, pickupContact, price } = req.body;
    const file = req.file;
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'User not authenticated' });

    if (!title || !description || !pickupAddress || !deliveryAddress || !pickupContact || !price) {
      return res.status(400).json({ message: 'Kindly fill all required fields' });
    }

    let image = null;

if (file) {
  const uploadResult = await cloudinary.uploader.upload(file.path, {
    folder: 'attachments',
    public_id: `attachment-${Date.now()}`,
    overwrite: true,
  });
  fs.unlinkSync(file.path);

  image = {
    publicId: uploadResult.public_id,
    url: uploadResult.secure_url,
  };
}


    const newErrand = await Errand.create({
      userId: user.id,
      title,
      description,
      pickupAddress,
      deliveryAddress,
      pickupContact,
      price: parseFloat(price),
      attachments: image,
    });

    return res.status(201).json({ message: 'Errand created successfully', data: newErrand });
  } catch (error) {
    console.error('Create Errand Error:', error);
    return res.status(500).json({
      message: 'Internal server error while creating errand',
      error: error.message,
    });
  }
};



exports.getAllErrands = async (req, res) => {
  try {
    const errands = await Errand.findAll({
      include: [{ model: User, attributes: ['id', 'fullname', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'All errands retrieved successfully',
      data: errands,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error while fetching errands',
      error: error.message,
    });
  }
};

exports.getErrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundErrand = await Errand.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'fullname', 'email'] }],
    });

    if (!foundErrand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    res.status(200).json({
      message: 'Errand retrieved successfully',
      data: foundErrand,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error while getting errand by ID',
      error: error.message,
    });
  }
};

exports.updateErrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, status, description, pickupAddress, pickupContact, price } = req.body;

    const foundErrand = await Errand.findByPk(id);
    if (!foundErrand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    await foundErrand.update({
      status: status || foundErrand.status,
      assignedTo: assignedTo || foundErrand.assignedTo,
      price: price || foundErrand.price,
      pickupAddress: pickupAddress || foundErrand.pickupAddress,
      pickupContact: pickupContact || foundErrand.pickupContact,
      description: description || foundErrand.description,
    });

    res.status(200).json({
      message: 'Errand updated successfully',
      data: foundErrand,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error while updating errand',
      error: error.message,
    });
  }
};

exports.deleteErrand = async (req, res) => {
  try {
    const { id } = req.params;
    const foundErrand = await Errand.findByPk(id);

    if (!foundErrand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    await foundErrand.destroy();

    res.status(200).json({
      message: 'Errand deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error while deleting errand',
      error: error.message,
    });
  }
};
