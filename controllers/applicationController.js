const { application } = require('express');
const db = require('../models');
const {RunnerApplication, Errand, User, KYC, Notification } = db
const { Op } = require('sequelize');

exports.applyForErrand = async (req, res) => {
  try {
    const { bidPrice } = req.body;
    const { errandId } = req.params; 
    const runnerId = req.user.id; 
    // Check if the User is a Client or Runner before applying for errands
    const user = await User.findByPk(runnerId)
    if (user.role !== 'Runner'){
      return res.status(400).json({ message: `Sorry ${user.firstName}, only Runners can apply for errands!`})
    }

    const runnerKYC = await KYC.findOne({where: {userId: runnerId}});
    if (!runnerKYC || runnerKYC.status !== 'verified'){
      return res.status(400).json({ message: 'Complete your KYC verification to apply for errands!'})
    }

    // Check if errand exists
    const errand = await Errand.findByPk(errandId);
    if (!errand) {
      return res.status(404).json({ message: 'Errand not found' });
    }
     const userExists = await User.findByPk(runnerId);
    if (!userExists) return res.status(400).json({ message: 'Runner does not exist' });

    // Prevent duplicate application
    const existingApp = await RunnerApplication.findOne({ where: { runnerId, errandId } });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this errand' });
    }

    if (!bidPrice){
      const acceptedPrice = await RunnerApplication.create({
      runnerId,
      errandId,
      currentPrice: errand.price ?? 0,
      status: 'Pending',
      })
      return res.status(200).json({message: 'Current price accepted for errand', data: acceptedPrice})
    } else {
     const proposedPrice = await RunnerApplication.create({
      runnerId,
      errandId,
      bidPrice,
      status: 'Pending',
    });
    return res.status(200).json({message: 'Proposed price for errand', data: proposedPrice})
    }
  } catch (error) {
    console.error('Error in applyForErrand:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getErrandApplications = async (req, res) => {
  try {
    const { errandId } = req.params;
    const errand = await Errand.findByPk(errandId);
    if (!errand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    const applications = await RunnerApplication.findAll({
      where: { errandId },
      include: [

        {
          model: User,
          as: 'runner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'rating', 'totalJobs', ],
        },
      ],
    });

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
    const { id } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await RunnerApplication.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await application.update({ status });

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

    const applications = await RunnerApplication.findByPk({
  where: { runnerId },
  include: [
    {
      model: Errand,
      as: 'errand',
      attributes: ['id', 'title', 'description', 'price', 'status', 'userId'],
      include: [
        {
          model: User,
          as: 'poster',  // this is the user who posted the errand
          attributes: ['id', 'firstName', 'lastname', 'email'],
        },
      ],
    },
    {
      model: User,
      as: 'runner', // the runner who applied
      attributes: ['id', 'firstName', 'lastname', 'totalJobs', 'bio'],
    },
  ],
});

    res.status(200).json({
      message: 'Fetched runner applications successfully',
      data: applications
    });
  } catch (error) {
    console.error('Error in getRunnerApplications:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getErrandApplicationsForArunner = async (req, res) => {
  try {
    const { errandId } = req.params;
    const {runnerId} = req.params;
    const errand = await Errand.findByPk(errandId);
    const applications = await RunnerApplication.findAll({
      where: { errandId, runnerId },
      include: [
        
        {
          model: User,
          as: 'runner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'rating', 'totalJobs', ],
        },
      ],
    });

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

    // Fetch the errand and verify the client owns it
    const errand = await Errand.findByPk(errandId);
    if (!errand) return res.status(404).json({ message: 'Errand not found' });
    if (errand.userId !== clientId)
      return res.status(403).json({ message: 'You are not authorized to accept applications for this errand' });

    // Get the selected runner application
    const application = await RunnerApplication.findByPk(applicationId);
    if (!application || application.errandId !== errandId)
      return res.status(404).json({ message: 'Application not found for this errand' });

    // Update selected application
    await application.update({ status: 'Accepted' });

    // Reject all other applications for this errand
    await RunnerApplication.update(
      { status: 'Rejected' },
      { where: { errandId, id: { [Op.ne]: applicationId } } }
    );
    const startOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();

    // Assign the errand to this runner
    await errand.update({ assignedTo: application.runnerId, status: 'Assigned', startOTP, deliveryOTP, startOTPExpires: null, deliveryOTPExpires: null });

     const notification = await Notification.create({
      userId: application.runnerId,
      type: 'application_accepted',
      message: `Your application for "${errand.title}" has been accepted.`,
      meta: { errandId: errand.id, applicationId: application.id, startOTP, deliveryOTP }
    });
  
    const client = await User.findByPk(clientId);
    if (client?.email) {
      // call your sendMail function or Brevo wrapper
      await sendMail(client.email, 'Errand Accepted', `<p>Your posted errand "${errand.title}" was accepted.</p><p>Start OTP: ${startOTP}</p>`);
    }
    return res.status(200).json({
      message: 'Runner application accepted successfully',
      data: {
        acceptedApplication: application,
        errand,
      },
    });
  } catch (error) {
    console.error('Error in acceptRunnerApplication:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit, offset
    });
    res.status(200).json({ 
      total: count,
      page,
      perPage: limit,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notif = await Notification.findOne({ where: { id, userId } });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    await notif.update({ isRead: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.rejectRunnerApplication = async (req, res) => {
  try {
    const { errandId, applicationId } = req.params;
    const clientId = req.user.id;

    // Verify the errand exists and belongs to the client
    const errand = await Errand.findByPk(errandId);
    if (!errand) return res.status(404).json({ message: 'Errand not found' });
    if (errand.userId !== clientId)
      return res.status(403).json({ message: 'You are not authorized to reject applications for this errand' });

    // Verify the application exists and belongs to this errand
    const application = await RunnerApplication.findByPk(applicationId);
    if (!application || application.errandId !== errandId)
      return res.status(404).json({ message: 'Runner application not found for this errand' });

    // Update application status to 'Rejected'
    await application.update({ status: 'Rejected' });

      const remaining = await RunnerApplication.count({
      where: { errandId, status: 'Pending' },
    });

    if (remaining === 0) {
      await errand.update({ status: 'Open' }); // or "Pending", depending on your business logic
    }

    return res.status(200).json({
      message: 'Runner application rejected successfully',
      data: {
        rejectedApplication: application,
        errand,
      },
    });
  } catch (error) {
    console.error('Error rejecting runner application:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
