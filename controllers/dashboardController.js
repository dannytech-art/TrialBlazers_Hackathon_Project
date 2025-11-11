const { Op } = require("sequelize");
const Errand = require("../models/errand");


exports.getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user.id;

console.log('ID: ', clientId);

    // Total errands created by the client
    const totalRequests = await Errand.count({ where: { userId: clientId } });

    // Completed errands
    const completedJobs = await Errand.count({
      where: { userId: clientId, status: "Completed" },
    });

    // Active errands (you can adjust the statuses)
    const activeJobs = await Errand.count({
      where: { userId:
        clientId,
        status: { [Op.in]: ["Assigned"] },
      },
    });

    // Total spent (sum of price for completed errands)
    const totalSpentResult = await Errand.findOne({
      where: { userId: clientId, status: "Completed" },
      attributes: [
        [Errand.sequelize.fn("SUM", Errand.sequelize.col("price")), "totalSpent"],
      ],
      raw: true,
    });

    const totalSpent = totalSpentResult?.totalSpent || 0;

    // Response
    return res.status(200).json({
      message: "Client dashboard data fetched successfully",
      data: {
        totalRequests,
        completedJobs,
        activeJobs,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      message: "Internal server error fetching dashboard data",
      error: error.message,
    });
  }
};
