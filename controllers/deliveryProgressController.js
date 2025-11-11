const Errand = require("../models/errand");

exports.updateProgress = async (req, res) => {
  try {
    const { errandId } = req.params;
    const { step } = req.body; // e.g. 'headingToPickup', 'arrivedAtPickup', etc.
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const errand = await Errand.findByPk(errandId);
    if (!errand) {
      return res.status(404).json({ message: "Errand not found" });
    }

    if (errand.assignedTo !== user.id) {
      return res.status(403).json({ message: "You are not assigned to this errand" });
    }

    const steps = {
      orderAssigned: "orderAssignedAt",
      headingToPickup: "headingToPickupAt",
      arrivedAtPickup: "arrivedAtPickupAt",
      itemPicked: "itemPickedAt",
      headingToDelivery: "headingToDeliveryAt",
      arrivedAtDelivery: "arrivedAtDeliveryAt",
      deliveredConfirmed: "deliveredConfirmedAt",
    };

    const field = steps[step];
    if (!field) {
      return res.status(400).json({ message: "Invalid step" });
    }

    // prevent overwriting if already completed
    if (errand[field]) {
      return res.status(400).json({ message: "This step is already completed" });
    }

    await errand.update({ [field]: new Date() });

    // auto update status if last step done
    if (step === "deliveredConfirmed") {
      await errand.update({ status: "Completed" });
    }

    res.status(200).json({
      message: `${step} step marked as completed`,
      timestamp: errand[field],
      data: errand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update progress",
      error: error.message,
    });
  }
};
