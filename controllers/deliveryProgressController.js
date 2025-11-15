const Errand = require("../models/errand");

exports.updateProgress = async (req, res) => {
  try {
    const { errandId } = req.params;
    const { step } = req.body;
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

    // Step definitions in correct order
    const STEPS = [
      { label: "Order assigned", key: "orderAssignedAt" },
      { label: "Runner heading to pickup", key: "headingToPickupAt" },
      { label: "Runner arrived at pickup location", key: "arrivedAtPickupAt" },
      { label: "Item picked up with (OTP)", key: "itemPickedAt" },
      { label: "Runner heading to delivery location", key: "headingToDeliveryAt" },
      { label: "Runner arrived at delivery location", key: "arrivedAtDeliveryAt" },
      { label: "Delivery confirmed (OTP)", key: "deliveredConfirmedAt" }
    ];

    const matchedStep = STEPS.find(s => s.key.toLowerCase() === `${step}at`.toLowerCase());
    
    // If frontend is sending short names e.g "itemPicked"
    const altMatch = STEPS.find(s => s.key.toLowerCase().includes(step.toLowerCase()));

    const finalStep = matchedStep || altMatch;

    console.log("Final Step Matched:", finalStep);

    if (!finalStep) {
      return res.status(400).json({ message: "Invalid step" });
    }

    // Prevent overwriting a completed step
    if (errand[finalStep.key]) {
      return res.status(400).json({ message: "This step is already completed" });
    }

    // Enforce sequential order
    const stepIndex = STEPS.findIndex(s => s.key === finalStep.key);

    if (stepIndex > 0) {
      const previousKey = STEPS[stepIndex - 1].key;
      if (!errand[previousKey]) {
        return res.status(400).json({
          message: `Complete previous step first: ${STEPS[stepIndex - 1].label}`
        });
      }
    }

    // Update this step timestamp
    await errand.update({ [finalStep.key]: new Date() });

    // Auto complete errand when last step done
    if (finalStep.key === "deliveredConfirmedAt") {
      await errand.update({ status: "Completed" });
    }

    return res.status(200).json({
      message: `${finalStep.label} completed successfully`,
      data: errand
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update progress",
      error: error.message
    });
  }
};



exports.getErrandProgresSummary = async (req, res) => {
  try {
    const { errandId } = req.params;

    const errand = await Errand.findByPk(errandId, {
      attributes: [
        "orderAssignedAt",
        "headingToPickupAt",
        "arrivedAtPickupAt",
        "itemPickedAt",
        "headingToDeliveryAt",
        "arrivedAtDeliveryAt",
        "deliveredConfirmedAt",
      ],
    });

    if (!errand) {
      return res.status(404).json({ message: "Errand not found" });
    }

    const steps = [
      { key: "orderAssignedAt", label: "Order assigned" },
      { key: "headingToPickupAt", label: "Runner heading to pickup" },
      { key: "arrivedAtPickupAt", label: "Runner arrived at pickup location" },
      { key: "itemPickedAt", label: "Item picked up with (OTP)" },
      { key: "headingToDeliveryAt", label: "Runner heading to delivery location" },
      { key: "arrivedAtDeliveryAt", label: "Runner arrived at delivery location" },
      { key: "deliveredConfirmedAt", label: "Delivery confirmed (OTP)" },
    ];

    // Format time
    const formatTime = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    // Build response
    const formatted = steps.map((step) => ({
      label: step.label,
      time: errand[step.key] ? formatTime(errand[step.key]) : null,
      done: !!errand[step.key],
    }));

    return res.status(200).json({
      message: "Progress summary fetched",
      data: formatted,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch progress summary",
      error: error.message,
    });
  }
};
