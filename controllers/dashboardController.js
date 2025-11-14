const { Op } = require("sequelize");
const Errand = require("../models/errand");
const User = require("../models/users");
const Payment = require("../models/payment");
const RunnerApplication = require("../models/runnerapplication");

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

exports.getRunnerDashboardSummary = async (req, res) => {
  try {
    const runnerId = req.user.id;

    // Ensure the user is actually a runner
    const user = await User.findByPk(runnerId);
    if (user.role !== "Runner") {
      return res.status(403).json({
        message: "Only runners can access this dashboard"
      });
    }

    // Total applications made
    const totalApplications = await RunnerApplication.count({
      where: { runnerId }
    });

    // Accepted jobs
    const acceptedJobs = await RunnerApplication.count({
      where: { runnerId, status: "Accepted" }
    });

    // Active jobs (errand assigned to this runner)
    const activeJobs = await Errand.count({
      where: {
        assignedTo: runnerId,
        status: ["Assigned", "In-Progress"]
      }
    });

    // Completed jobs
    const completedJobs = await Errand.count({
      where: {
        assignedTo: runnerId,
        status: "Completed"
      }
    });

    // Total earnings (optional)
    const totalEarningsData = await Payment.sum("amount", {
      where: {
        receiverId: runnerId,
        paymentStatus: "Paid"
      }
    });

    const totalEarnings = totalEarningsData || 0;

    return res.status(200).json({
      message: "Runner dashboard summary",
      data: {
        totalApplications,
        acceptedJobs,
        activeJobs,
        completedJobs,
        totalEarnings
      }
    });

  } catch (error) {
    console.error("Dashboard Error →", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
