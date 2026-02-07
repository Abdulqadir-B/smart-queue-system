/**
 * Token Operations Controller
 * Handles token issuance and processing
 */
const { Queue, QueueToken } = require("../models");
const { AppError } = require("../middleware");
const {
  maskCustomerData,
  canViewFullCustomerData,
} = require("../utils/privacy");

/**
 * Join queue -> returns new token number
 * @route POST /api/queues/:name/join
 */
exports.joinQueue = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { customerName, phone, email } = req.body || {};

    const queue = await Queue.findOne({ name });
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    // Validate that customerName is provided and has minimum length
    if (!customerName || !customerName.trim()) {
      throw new AppError("Customer name is required", 400);
    }

    const trimmedName = customerName.trim();
    if (trimmedName.length < 3) {
      throw new AppError(
        "Customer name must be at least 3 characters long",
        400
      );
    }

    // Check for duplicate token in last 24 hours (flexible matching based on provided fields)
    const config = require("../config");
    const duplicateCheckTime = new Date(
      Date.now() - config.rateLimit.duplicateCheckWindow
    );

    // Build flexible duplicate query based on provided fields
    const duplicateQuery = {
      queue: queue._id,
      createdAt: { $gte: duplicateCheckTime },
      status: { $in: ["waiting", "called"] }, // Only check active tokens
      "customer.name": trimmedName,
    };

    // Add phone to query if provided
    if (phone && phone.trim()) {
      duplicateQuery["customer.phone"] = phone.trim();
    }

    // Add email to query if provided
    if (email && email.trim()) {
      duplicateQuery["customer.email"] = email.trim().toLowerCase();
    }

    const existingToken = await QueueToken.findOne(duplicateQuery);

    if (existingToken) {
      // Calculate current position and wait time
      const currentPosition = existingToken.tokenNumber - queue.servingToken;
      const estimatedWaitTime = currentPosition > 0 ? currentPosition * 5 : 0;

      return res.status(409).json({
        status: "error",
        message: "You already have an active token in this queue",
        data: {
          existingToken: {
            token: existingToken.tokenNumber,
            queue: queue.name,
            verificationKey: existingToken.verificationKey,
            status: existingToken.status,
            position: currentPosition > 0 ? currentPosition : 0,
            estimatedWaitTime,
            createdAt: existingToken.createdAt,
          },
        },
      });
    }

    // Increment token number
    queue.lastToken += 1;
    await queue.save();

    // Calculate estimated wait time (simple calculation: 5 minutes per waiting customer)
    const waitingCount = queue.lastToken - queue.servingToken;
    const estimatedWaitTime = waitingCount * 5; // 5 minutes per customer

    // Generate a unique 6-digit verification key for secure token tracking
    const verificationKey = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Create individual queue token record
    const queueToken = new QueueToken({
      queue: queue._id,
      queueName: queue.name,
      tokenNumber: queue.lastToken,
      user: req.user?.userId || null, // Link to user if authenticated
      customer: {
        name: customerName.trim(),
        phone: phone || "",
        email: email || "",
      },
      verificationKey,
      estimatedWaitTime,
    });

    await queueToken.save();

    // Get socket service instance
    const socketService = req.app.get("socketService");
    if (socketService) {
      // Emit real-time update
      socketService.emitQueueUpdate(queue.name, {
        action: "join",
        lastToken: queue.lastToken,
        waiting: waitingCount,
        estimatedWaitTime,
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        token: queue.lastToken,
        queue: queue.name,
        verificationKey,
        estimatedWaitTime,
        position: waitingCount,
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("joinQueue error", err);
    return next(new AppError("Failed to join queue", 500));
  }
};

/**
 * Call next token (staff)
 * @route POST /api/queues/:name/next
 */
exports.callNext = async (req, res, next) => {
  try {
    const { name } = req.params;
    const queue = await Queue.findOne({ name });
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    if (!queue.isActive) {
      throw new AppError("Queue is currently paused", 423);
    }

    if (queue.servingToken >= queue.lastToken) {
      // Get socket service instance and emit update even when queue is empty
      const socketService = req.app.get("socketService");
      if (socketService) {
        socketService.emitQueueUpdate(queue.name, {
          action: "next",
          servingToken: queue.servingToken,
          lastToken: queue.lastToken,
          waiting: 0,
          message: "No waiting customers",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "No waiting customers",
        data: {
          serving: queue.servingToken,
          lastToken: queue.lastToken,
        },
      });
    }

    // Increment serving token
    queue.servingToken += 1;
    await queue.save();

    // Find and update the token record
    const token = await QueueToken.findOne({
      queueName: queue.name,
      tokenNumber: queue.servingToken,
    });

    if (token) {
      // Mark token as being served
      await token.markServing();
    }

    // Get socket service instance
    const socketService = req.app.get("socketService");
    if (socketService) {
      // Emit notification to individual customer whose token is called
      socketService.emitTokenCalled(queue.name, queue.servingToken);

      // Also emit general queue update
      socketService.emitQueueUpdate(queue.name, {
        action: "next",
        servingToken: queue.servingToken,
        lastToken: queue.lastToken,
        waiting: queue.lastToken - queue.servingToken,
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        serving: queue.servingToken,
        lastToken: queue.lastToken,
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("callNext error", err);
    return next(new AppError("Failed to call next token", 500));
  }
};

/**
 * Complete service for a token
 * @route POST /api/queues/:name/complete
 */
exports.completeService = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { tokenNumber } = req.body;

    const queue = await Queue.findOne({ name });
    if (!queue) {
      throw new AppError("Queue not found", 404);
    }

    // Find the token without status filter first
    const token = await QueueToken.findOne({
      queueName: name,
      tokenNumber: parseInt(tokenNumber, 10),
    });

    if (!token) {
      throw new AppError("Token not found", 404);
    }

    // If token is not in serving state, update it to serving first
    if (token.status !== "serving") {
      await token.markServing();
    }

    // Mark as served
    await token.markServed();

    // Automatically call next token if there are more waiting
    let nextServingToken = queue.servingToken;
    if (queue.servingToken < queue.lastToken) {
      // Increment serving token to the next one
      queue.servingToken += 1;
      await queue.save();
      nextServingToken = queue.servingToken;

      // Find and mark the next token as serving
      const nextToken = await QueueToken.findOne({
        queueName: queue.name,
        tokenNumber: nextServingToken,
      });

      if (nextToken) {
        await nextToken.markServing();
      }
    }

    // Get socket.io instance
    const socketService = req.app.get("socketService");
    if (socketService) {
      // Emit real-time update for completion
      socketService.emitQueueUpdate(queue.name, {
        action: "complete",
        completedToken: token.tokenNumber,
        servingToken: nextServingToken,
        waiting: queue.lastToken - nextServingToken,
      });

      // If we called the next token, emit that event too
      if (nextServingToken > token.tokenNumber) {
        socketService.emitTokenCalled(queue.name, nextServingToken);
      }
    }

    return res.status(200).json({
      status: "success",
      data: {
        token: token.tokenNumber,
        queue: queue.name,
        waitTime: token.getWaitTime(),
        serviceTime: token.getServiceTime(),
        nextServing: nextServingToken,
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("completeService error", err);
    return next(new AppError("Failed to complete service", 500));
  }
};

/**
 * Get token status
 * @route GET /api/queues/:name/token/:tokenNumber
 */
exports.getTokenStatus = async (req, res, next) => {
  try {
    const { name, tokenNumber } = req.params;
    const { verificationKey } = req.query;

    // Verification key is required for security
    if (!verificationKey) {
      throw new AppError(
        "Verification key is required to track your token",
        401
      );
    }

    // Find the token
    const token = await QueueToken.findOne({
      queueName: name,
      tokenNumber: parseInt(tokenNumber, 10),
    });

    if (!token) {
      throw new AppError("Token not found", 404);
    }

    // Verify the key matches
    if (token.verificationKey !== verificationKey) {
      throw new AppError(
        "Invalid verification key. You can only track your own token.",
        403
      );
    }

    // Get the queue for current status
    const queue = await Queue.findOne({ name });

    // Calculate position in queue
    let position = null;
    if (token.status === "waiting") {
      position = token.tokenNumber - (queue ? queue.servingToken : 0);
      if (position < 0) position = 0;
    }

    return res.status(200).json({
      status: "success",
      data: {
        token: token.tokenNumber,
        queue: token.queueName,
        status: token.status,
        position,
        customer: token.customer,
        estimatedWaitTime: token.estimatedWaitTime,
        createdAt: token.createdAt,
        calledAt: token.calledAt,
        servedAt: token.servedAt,
        waitTime: token.getWaitTime(),
        serviceTime: token.getServiceTime(),
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("getTokenStatus error", err);
    return next(new AppError("Failed to get token status", 500));
  }
};

/**
 * List all tokens for a queue
 * @route GET /api/queues/:name/tokens
 */
exports.listQueueTokens = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { status, date } = req.query;

    // Check if queue exists
    const queueExists = await Queue.exists({ name });
    if (!queueExists) {
      throw new AppError("Queue not found", 404);
    }

    // Build query
    const query = { queueName: name };

    // Filter by status if provided
    if (
      status &&
      ["waiting", "serving", "served", "abandoned"].includes(status)
    ) {
      query.status = status;
    }

    // Filter by date if provided (date format: YYYY-MM-DD)
    if (date) {
      try {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        query.createdAt = {
          $gte: startDate,
          $lt: endDate,
        };
      } catch (err) {
        throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
      }
    }

    // Get tokens
    const tokens = await QueueToken.find(query)
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent overloading

    // Mask customer data based on user role
    const userRole = req.user ? req.user.role : null;
    const canViewFullData = canViewFullCustomerData(userRole);

    const maskedTokens = tokens.map((token) => {
      const tokenObj = token.toObject();

      // If user is not admin, mask customer PII
      if (!canViewFullData && tokenObj.customer) {
        tokenObj.customer = maskCustomerData(tokenObj.customer);
      }

      // Remove verification key from list view (security)
      delete tokenObj.verificationKey;

      return tokenObj;
    });

    return res.status(200).json({
      status: "success",
      results: maskedTokens.length,
      data: maskedTokens,
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("listQueueTokens error", err);
    return next(new AppError("Failed to list tokens", 500));
  }
};

/**
 * Mark token as abandoned
 * @route POST /api/queues/:name/token/:tokenNumber/abandon
 */
exports.abandonToken = async (req, res, next) => {
  try {
    const { name, tokenNumber } = req.params;

    // Find the token
    const token = await QueueToken.findOne({
      queueName: name,
      tokenNumber: parseInt(tokenNumber, 10),
      status: { $in: ["waiting", "serving"] },
    });

    if (!token) {
      throw new AppError("Token not found or already processed", 404);
    }

    // Mark as abandoned
    await token.markAbandoned();

    // Get socket.io instance
    const io = req.app.get("socketio");
    if (io) {
      // Emit real-time update
      io.emit("queue:update", {
        action: "abandon",
        queueName: name,
        abandonedToken: token.tokenNumber,
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        token: token.tokenNumber,
        queue: token.queueName,
        status: "abandoned",
      },
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("abandonToken error", err);
    return next(new AppError("Failed to abandon token", 500));
  }
};

/**
 * Get active tokens for logged-in user
 * @route GET /api/tokens/my-tokens
 */
exports.getMyActiveTokens = async (req, res, next) => {
  try {
    // Ensure user is authenticated (middleware should handle this)
    if (!req.user || !req.user.userId) {
      throw new AppError("Authentication required", 401);
    }

    // Find all active tokens for this user
    const tokens = await QueueToken.find({
      user: req.user.userId,
      status: { $in: ["waiting", "serving"] },
    })
      .select("queueName tokenNumber verificationKey status")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: "success",
      results: tokens.length,
      data: tokens,
    });
  } catch (err) {
    if (err.isOperational) {
      return next(err);
    }
    console.error("getMyActiveTokens error", err);
    return next(new AppError("Failed to fetch active tokens", 500));
  }
};
