const Errand = require("../models/errand");

exports.progress = async (req, res) => {
  try {
    const { errandId } = req.params;
    const user = req.user; // from auth middleware

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const errand = await Errand.findByPk(errandId);

    if (!errand) {
      return res.status(404).json({ message: 'Errand not found' });
    }

    // Ensure only the assigned runner can trigger the progress update
    if (errand.assignedTo !== user.id) {
      return res.status(403).json({ message: 'You are not assigned to this errand' });
    }

    // Respond with a truthy status indicator
    res.status(200).json({
      message: 'Progress updated successfully',
      progress: 1, // truthy value for UI progress bar
      data: {
        id: errand.id,
        title: errand.title,
        status: errand.status,
        assignedTo: errand.assignedTo,
        pickupAddress: errand.pickupAddress,
        deliveryAddress: errand.deliveryAddress,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
