const { sendMail } = require('../middleware/email');
const RunnerApplication = require('../models/runnerapplication');
const Errand = require('../models/errand');
const KYC = require('../models/kyc');
const User = require('../models/users');
const Notification = require('../models/notification')


exports.applyForErrand = async (req, res) => {
  try {
    const { bidPrice } = req.body;
    const { errandId } = req.params; 
    const runnerId = req.user.id; 

    // Validate Runner Role
    const user = await User.findById(runnerId);
    if (user.role !== 'Runner') {
      return res.status(400).json({ message: `Sorry ${user.firstName}, only Runners can apply for errands!` });
    }

    // Check KYC
    const runnerKYC = await KYC.findOne( { userId: runnerId });
    if (!runnerKYC || runnerKYC.status !== 'verified') {
      return res.status(400).json({ message: 'Complete your KYC verification to apply for errands!' });
    }

      const existing = await RunnerApplication.findOne( { runnerId, errandId });

    if (existing && existing.status === 'Rejected') {
        return res.status(400).json({
          message: 'You cannot reapply for this errand after being rejected.'
    });
  }

    // Check Errand Exists
    const errand = await Errand.findById(errandId);
    if (!errand) return res.status(404).json({ message: 'Errand not found' });

    // Prevent Duplicate Application
    const existingApp = await RunnerApplication.findOne({ runnerId, errandId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this errand' });
    }

    const clientId = errand.userId; 

    let application;

    // Runner accepted listed price
    if (!bidPrice) {
      application = await RunnerApplication.create({
        runnerId,
        errandId,
        currentPrice: errand.price ?? 0,
        status: 'Pending',
      });

      // Notify Client
      await Notification.create({
        userId: clientId,
        type: 'runner_applied',
        message: `${user.firstName} applied for your errand "${errand.title}".`,
        meta: {
          errandId,
          applicationId: application.id,
          runnerId
        }
      });

      return res.status(200).json({
        message: 'Current price accepted for errand',
        data: application
      });

    } else {
      // Runner proposed custom price
      application = await RunnerApplication.create({
        runnerId,
        errandId,
        bidPrice,
        status: 'Pending',
      });

      // Notify Client
      await Notification.create({
        userId: clientId,
        type: 'runner_applied',
        message: `${user.firstName} proposed a bid for your errand "${errand.title}".`,
        meta: {
          errandId,
          applicationId: application.id,
          runnerId,
          proposedAmount: bidPrice
        }
      });

      return res.status(200).json({
        message: 'Proposed price submitted for errand',
        data: application
      });
    }

  } catch (error) {
    console.error('Error in applyForErrand:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getErrandApplications = async (req, res) => {
  try {
    const { errandId } = req.params;
    const errand = await Errand.findById(errandId);
    if (!errand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    const applications = await RunnerApplication.find({ errandId })
    .populate({
        path: 'runner',
        select: "id firstName lastName email bio rating totalJobs"
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Found ${applications.length} applications for this errand`,
      data: applications,
      pickupContact: errand.pickupContact
    });
  } catch (error) {
    console.error('Error in getErrandApplications:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // application ID
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    //  Find application
    const application = await RunnerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // 2. Check if this errand already has an accepted runner
    const existingAccepted = await RunnerApplication.findOne({
      errandId: application.errandId,
      status: 'Accepted'
    });

    // If client is trying to accept a NEW runner while one is already accepted
    if (status === 'Accepted' && existingAccepted && existingAccepted._id.toString() !== id) {
      return res.status(400).json({
        message: 'This errand already has an accepted runner. You cannot accept another runner.'
      });
    }

    // 4. Update status
    application.status = status;
    await application.save();

    res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      data: application,
    });

  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


exports.getRunnerApplications = async (req, res) => {
  try {
    const runnerId = req.user.id;

    const applications = await RunnerApplication.find({ runnerId })
      .populate({
        path: "errandId",
        select: "title description price status userId",
        populate: {
          path: "userId",
          select: "firstName lastName email"
        }
      })
      .populate({
        path: "runnerId",
        select: "firstName lastName totalJobs bio"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Fetched runner applications successfully",
      data: applications
    });
  } catch (error) {
    console.error("Error in getRunnerApplications:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};


exports.getErrandApplicationsForArunner = async (req, res) => {
  try {
    const { errandId } = req.params;
    const {runnerId} = req.params;
    const errand = await Errand.findById(errandId);
    const applications = await RunnerApplication.find({ errandId, runnerId })
    .populate({
        path: 'runner',
        select: "id firstName lastName email bio rating totalJobs"
    })
    .sort({ createdAt: -1});

    res.status(200).json({
      message: `Found ${applications.length} applications for this errand`,
      data: applications,
      pickupContact: errand.pickupContact
    });
  } catch (error) {
    console.error('Error in getErrandApplications:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.acceptRunnerApplication = async (req, res) => {
  try {
    const { errandId, applicationId } = req.params;
    const clientId = req.user.id;

    // Fetch errand
    const errand = await Errand.findById(errandId);
    if (!errand) return res.status(404).json({ message: "Errand not found" });
    
    // Make sure client owns the errand
    if (String(errand.userId) !== String(clientId)) {
    return res.status(403).json({ message: "You are not authorized to accept applications for this errand" });
}
    // PREVENT accepting more than one runner
    if (errand.assignedTo) {
      return res.status(400).json({
        message: "You have already accepted a runner for this errand. You cannot accept another."
      });
    }

    // Fetch the application
    const application = await RunnerApplication.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.errandId.toString() !== errandId)
      return res.status(404).json({ message: "Application does not belong to this errand" });

    // Determine final errand price
    const finalPrice = application.bidPrice || application.currentPrice;

    // Update Errand price
    errand.price = finalPrice;

    // Generate OTPs
    const startOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();

    // Assign errand
    errand.assignedTo = application.runnerId;
    errand.status = "Assigned";
    errand.startOTP = startOTP;
    errand.deliveryOTP = deliveryOTP;
    errand.startOTPExpires = null;
    errand.deliveryOTPExpires = null;
    await errand.save();

    // Mark this application as accepted
    application.status = "Accepted";
    await application.save();

    // Reject all other applications
    await RunnerApplication.updateMany(
      {
        errandId,
        _id: { $ne: applicationId }
      },
      { $set: { status: "Rejected" } }
    );

    // Create notification
    await Notification.create({
      userId: application.runnerId,
      type: "application_accepted",
      message: `Your application for "${errand.title}" has been accepted.`,
      meta: {
        errandId: errand._id,
        applicationId: application._id,
        startOTP,
        deliveryOTP
      }
    });

    const client = await User.findById(clientId);
    if (client?.email) {
      await sendMail(
        client.email,
        "Errand Accepted",
        `<p>Your errand "${errand.title}" has been accepted.</p>
         <p>Start OTP: ${startOTP}</p>
         <p>Delivery OTP: ${deliveryOTP}</p>`
      );
    }

    return res.status(200).json({
      message: "Runner application accepted successfully",
      data: {
        acceptedApplication: application,
        errand
      }
    });

  } catch (error) {
    console.error("Error in acceptRunnerApplication:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Count total notifications
    const total = await Notification.countDocuments({ userId });

    // Fetch notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      notifications,
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification
    });

  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "All notifications marked as read"
    });

  } catch (error) {
    console.error("Error marking all notifications:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectRunnerApplication = async (req, res) => {
  try {
    const { errandId, applicationId } = req.params;
    const clientId = req.user.id;

    // 1. Verify errand exists & belongs to client
    const errand = await Errand.findById(errandId);
    if (!errand)
      return res.status(404).json({ message: "Errand not found" });

    if (String(errand.userId) !== String(clientId))
      return res.status(403).json({ message: "You are not authorized to reject applications for this errand" });

    // 2. Verify application exists and belongs to this errand
    const application = await RunnerApplication.findById(applicationId);
    if (!application || String(application.errandId) !== String(errandId))
      return res.status(404).json({ message: "Runner application not found for this errand" });

    // 3. Mark application as rejected
    application.status = "Rejected";
    await application.save();

    // 4. Check if any pending applications remain
    const remaining = await RunnerApplication.countDocuments({
      errandId,
      status: "Pending"
    });

    if (remaining === 0) {
      errand.status = "Open";
      await errand.save();
    }

    // 5. Send notification to runner
    await Notification.create({
      userId: application.runnerId,
      type: "application_rejected",
      title: "Application Rejected",
      message: `Your application for the errand "${errand.title}" was rejected by the client.`,
      isRead: false,
    });

    // 6. Delete application completely (Mongoose version)
    await RunnerApplication.findByIdAndDelete(applicationId);

    return res.status(200).json({
      message: "Runner application rejected successfully",
      data: { rejectedApplication: application }
    });

  } catch (error) {
    console.error("Error rejecting runner application:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
