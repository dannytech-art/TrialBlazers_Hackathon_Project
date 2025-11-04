const cloudinary = require('../config/cloudinary')
const fs = require('fs');
const db = require('../models');
const {KYC, User} = db

exports.submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;

    const { governmentIdCard, proofOfAddressImage, selfieWithIdCard } = req.files;
    
    if (!governmentIdCard || !proofOfAddressImage || !selfieWithIdCard) {
      return res.status(400).json({ message: 'All three documents are required' });
    }
    
    const existingKYC = await KYC.findOne({ where: { userId } });
    if (existingKYC) {
      return res.status(400).json({ message: 'KYC already submitted for this user' });
    }

  
    // Upload to Cloudinary one by one
    const uploadToCloudinary = async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: 'kyc_uploads' });
      fs.unlinkSync(file.path); 
      return result.secure_url; 
    };

    const governmentIdCardUrl = await uploadToCloudinary(governmentIdCard[0]);
    const proofOfAddressUrl = await uploadToCloudinary(proofOfAddressImage[0]);
    const selfieWithIdUrl = await uploadToCloudinary(selfieWithIdCard[0]);

    // Save to DB
    const newKYC = await KYC.create({
      userId,
      governmentIdCard: governmentIdCardUrl,
      proofOfAddressImage: proofOfAddressUrl,
      selfieWithIdCard: selfieWithIdUrl,
      status: 'pending',
    });

    res.status(201).json({
      message: 'KYC submitted successfully. Awaiting review.',
      data: newKYC,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Get KYC Status
exports.getMyKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const kyc = await KYC.findOne({ where: { userId } });

    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    res.status(200).json({
      message: 'Fetched KYC details successfully',
      data: kyc,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Admin Get All KYC Submissions 
exports.getAllKYC = async (req, res) => {
  try {
    const kycs = await KYC.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Fetched all KYC submissions successfully',
      data: kycs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Admin Update KYC Status
exports.updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!['approved', 'rejected', 'verified'].includes(status)) {
      return res.status(400).json({ message: 'Invalid KYC status' });
    }
  
    const kyc = await KYC.findByPk(id);
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    const updateKYC = {
      kycStatus: "verified"
    }
    await kyc.update({ status, reviewedBy: req.admin.id });
    await User.update(updateKYC, {where: {id: kyc.userId}})

    res.status(200).json({
      message: `KYC ${status} successfully`,
      data: kyc,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
