const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const RunnerApplication = require('../models/runnerapplication');
const Errand = require('../models/errand');
const User = require('../models/users');
const KYC = require('../models/kyc');
const Wallet = require('../models/wallet');

exports.createErrand = async (req, res) => {
  try {
    const { title, description, pickupAddress, deliveryAddress, pickupContact, price } = req.body;
    const file = req.file;
    const userFromToken = req.user; // This contains only `id` (from JWT)
    const userId = req.user.id

    if (!userFromToken) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const fullUser = await User.findById(userFromToken.id);
    if (!fullUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullUser.role !== 'Client') {
      return res.status(403).json({ message: 'Only Clients can create errands' });
    };

    const clientKYC = await KYC.findOne({userId});
    
    if (!clientKYC || clientKYC.status !== 'verified'){
      return res.status(400).json({ message: 'Complete your KYC verification to post an errand!'})
    }

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

    // Create errand using fullUser.id
    const newErrand = await Errand.create({
      userId: fullUser.id,
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
    const errands = await Errand.find()
      .select("-startOTP -deliveryOTP -startOTPExpires -deliveryOTPExpires")
      .populate({
        path: "userId",
        select: "id firstName lastName email"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All errands retrieved successfully",
      totalErrands: errands.length,
      data: errands,
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal server error while fetching errands",
      error: error.message,
    });
  }
};


exports.getErrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const foundErrand = await Errand.findById(id)
      .populate({
        path: "userId",
        select: "id firstName lastName email bio"
      })
      .populate({
        path: "assignedTo",
        select: "id firstName lastName email bio rating totalJobs"
      });

    if (!foundErrand) {
      return res.status(404).json({ message: "Errand not found" });
    }

    return res.status(200).json({
      message: "Errand retrieved successfully",
      data: foundErrand,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while getting errand by ID",
      error: error.message,
    });
  }
};


exports.getErrandByClientId = async (req, res) => {
  try {
    const userFromToken = req.user;

    const errands = await Errand.find({ userId: userFromToken.id })
      .select("-startOTP -deliveryOTP -startOTPExpires -deliveryOTPExpires")
      .populate({
        path: "assignedTo",
        select: "id firstName lastName email"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Errands retrieved successfully",
      data: errands,
    });

  } catch (error) {
    console.error("Fetching Errand Error:", error);
    res.status(500).json({
      message: "Internal server error while fetching errand",
      error: error.message,
    });
  }
};

exports.getErrandByRunnerId = async (req, res) => {
  try {
    const userFromToken = req.user;

    const errands = await Errand.find({ assignedTo: userFromToken.id })
      .select("-startOTP -deliveryOTP -startOTPExpires -deliveryOTPExpires")
      .populate({
        path: "userId",
        select: "id firstName lastName email"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Runner’s errands retrieved successfully",
      data: errands,
    });

  } catch (error) {
    console.error("Fetching Errand Error:", error);
    res.status(500).json({
      message: "Internal server error while fetching errand",
      error: error.message,
    });
  }
};

exports.updateErrand = async (req, res) => {
  try {
    const user = req.user;
    const file = req.file;
    const { id } = req.params;
    const { title, description, pickupAddress, deliveryAddress, pickupContact, price } = req.body;

    const foundErrand = await Errand.findById(id);
    if (!foundErrand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    if (foundErrand.userId !== user.id) {
      return res.status(403).json({ message: 'You are not allowed to update this errand' });
    }

    let updatedImage = foundErrand.attachments;

    if (file) {
      // If the errand already had an image, delete the old one from Cloudinary
      if (foundErrand.attachments && foundErrand.attachments.publicId) {
        try {
          await cloudinary.uploader.destroy(foundErrand.attachments.publicId);
        } catch (err) {
          console.warn('Cloudinary delete failed:', err.message);
        }
      }

      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'attachments',
        public_id: `attachment-${Date.now()}`,
        overwrite: true,
      });

      // Delete the local file after upload
      fs.unlinkSync(file.path);

      updatedImage = {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }
        foundErrand.title = title || foundErrand.title;
        foundErrand.description= description || foundErrand.description;
        foundErrand.pickupAddress = pickupAddress || foundErrand.pickupAddress;
        foundErrand.deliveryAddress = deliveryAddress || foundErrand.deliveryAddress;
        foundErrand.pickupContact = pickupContact || foundErrand.pickupContact;
        foundErrand.price = price ? parseFloat(price) : foundErrand.price;
        foundErrand.attachments = updatedImage,

    await foundErrand.save();

    res.status(200).json({
      message: 'Errand updated successfully',
      data: foundErrand,
    });
  } catch (error) {
    console.error('Update Errand Error:', error);
    res.status(500).json({
      message: 'Internal server error while updating errand',
      error: error.message,
    });
  }
};

exports.deleteErrand = async (req, res) => {
  try {
    const { id } = req.params;
    const foundErrand = await Errand.findById(id);

    if (!foundErrand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    await Errand.findByIdAndDelete(id);

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

exports.verifyStartOtp = async (req, res) => {
  try {
    const {otp} = req.body;
     const{errandId} = req.params;
    const runnerId = req.user.id
    const errand = await Errand.findByPk(errandId);
     if (!errand) return res.status(404).json({ message: 'Errand not found' });

    const application = await RunnerApplication.findOne({ errandId, runnerId });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    if (String(otp).trim() !== String(errand.startOTP).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
   }

   errand.startOTP = null;
   await errand.save();

    return res.status(200).json({
          message: 'Start OTP verified',
        })
  } catch (error) {
  res.status(500).json({
      message: 'Internal server error while verifying start OTP',
      error: error.message
    });
  }  
}

exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { errandId } = req.params;
    const runnerId = req.user.id;

    // Find Errand
    const errand = await Errand.findById(errandId);
    if (!errand) {
      return res.status(404).json({ message: "Errand not found" });
    }

    //  Find Runner Application
    const application = await RunnerApplication.findOne({
      errandId: errandId,
      runnerId: runnerId
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    //  Validate OTP
    if (String(otp).trim() !== String(errand.deliveryOTP).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    errand.deliveryOTP = null;
    errand.status = "Completed";
    await errand.save();

    //  Wallet Logic
    const commissionRate = 0.10;
    const amountToCredit = Number(errand.price) * (1 - commissionRate);

    let wallet = await Wallet.findOne({ runnerId });

    if (!wallet) {
      wallet = await Wallet.create({
        runnerId,
        balance: 0,
        lastTransactionAt: new Date(),
      });
    }

    wallet.balance = Number(wallet.balance) + amountToCredit;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    return res.status(200).json({
      message: `Delivery OTP verified! Crediting NGN ${amountToCredit} to your wallet.`,
      creditedAmount: amountToCredit,
      walletBalance: wallet.balance
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error while verifying delivery OTP",
      error: error.message
    });
  }
};
