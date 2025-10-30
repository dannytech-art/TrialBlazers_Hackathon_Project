const Application = require('../models/runnerapplication');
const Errand = require('../models/errand');
const User = require('../models/users');

exports.applyForErrand = async (req, res) => {
  try {
    const { bidPrice, message } = req.body;
    const { errandId } = req.params; 
    const runnerId = req.user.id; 

    console.log('Runner ID from token:', runnerId);

    // Check if errand exists
    const errand = await Errand.findByPk(errandId);
    if (!errand) {
      return res.status(404).json({ message: 'Errand not found' });
    }
     const userExists = await User.findByPk(runnerId);
    if (!userExists) return res.status(400).json({ message: 'Runner does not exist' });

    // Prevent duplicate application
    const existingApp = await Application.findOne({ where: { runnerId, errandId } });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this errand' });
    }

    // Create new application
    const application = await Application.create({
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

    const applications = await Application.findAll({
      where: { errandId },
      include: [
        {
          model: User,
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

    const application = await Application.findByPk(id);
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

    const applications = await Application.findAll({
      where: { runnerId },
      include: [
        {
          model: Errand,
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
