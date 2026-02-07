/**
 * Analytics Controller
 * Handles data analytics and statistics
 */
const { Queue } = require("../models");
const { AppError } = require("../middleware");

/**
 * Get basic analytics counts
 * @route GET /api/queues/analytics/counts
 */
exports.analyticsCounts = async (_req, res, next) => {
  try {
    const [totalQueues, activeQueues, sums] = await Promise.all([
      Queue.countDocuments({}),
      Queue.countDocuments({ isActive: true }),
      Queue.aggregate([
        {
          $group: {
            _id: null,
            totalTokensIssued: { $sum: "$lastToken" },
            totalTokensServed: { $sum: "$servingToken" },
          },
        },
      ]),
    ]);

    const agg = sums[0] || { totalTokensIssued: 0, totalTokensServed: 0 };

    return res.status(200).json({
      status: "success",
      data: {
        totalQueues,
        activeQueues,
        totalTokensIssued: agg.totalTokensIssued || 0,
        totalTokensServed: agg.totalTokensServed || 0,
      },
    });
  } catch (err) {
    console.error("analyticsCounts error", err);
    return next(new AppError("Failed to get analytics", 500));
  }
};
