const db = require('../models');
const {RunnerApplication, Errand, User, KYC } = db

exports.applyForErrand = async (req, res) => {
  try {
    const { bidPrice, message } = req.body;
    const { errandId } = req.params; 
    const runnerId = req.user.id; 
    // Check if the User is a Client or Runner before applying for errands
    const user = await User.findByPk(runnerId)
    if (user.role !== 'Runner'){
      return res.status(400).json({ message: `Sorry ${user.firstName}, only Runners can apply for errands!`})
    }

    // const runnerKYC = await KYC.findByPk(runnerId);
    // if (!runnerKYC || runnerKYC.status !== 'verified'){
    //   return res.status(400).json({ message: 'Complete KYC verification to apply for errands!'})
    // }
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

    // Create new application
    const application = await RunnerApplication.create({
      runnerId,
      errandId,
      message,
      bidPrice,
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error in applyForErrand:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getErrandApplications = async (req, res) => {
  try {
    const { errandId } = req.params;

    const applications = await RunnerApplication.findAll({
      where: { errandId },
      include: [
        {
          model: User,
          as: 'runner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(200).json({
      message: `Found ${applications.length} applications for this errand`,
      data: applications,
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

    const applications = await RunnerApplication.findAll({
      where: { runnerId },
      include: [
        {
          model: Errand,
          as: 'errand',
          attributes: ['id', 'title', 'description', 'price', 'status'],
        },
      ],
    });

    res.status(200).json({
      message: 'Fetched runner applications successfully',
      data: applications,
    });
  } catch (error) {
    console.error('Error in getRunnerApplications:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
