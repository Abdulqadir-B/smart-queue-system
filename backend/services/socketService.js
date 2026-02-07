/**
 * Socket.io service to manage real-time communication
 * with JWT authentication and role-based authorization
 */

const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

// Store active connections by queue name for more efficient broadcasts
const activeConnections = {
  customers: new Map(), // Map of socketId -> { queueName, tokenNumber }
  staff: new Map(), // Map of socketId -> [queueNames]
  admins: new Map(), // Map of socketId -> socketId (just tracking admin connections)
};

const setupSocketIO = (io) => {
  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      // Extract token from handshake auth or query
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        // Allow connection without auth for public features (customer join)
        // We'll verify role when they try to subscribe as staff/admin
        socket.user = null;
        return next();
      }

      // Verify token
      const decoded = verifyToken(token);

      // Find user in database
      const user = await User.findById(decoded.userId).select("-password");

      if (!user || !user.isActive) {
        return next(new Error("Invalid or inactive user"));
      }

      // Attach user to socket
      socket.user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      // Allow connection but without user (for public features)
      socket.user = null;
      next();
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Customer joins a queue - tracks which queue and token they're waiting for
    socket.on("customer:join", ({ queueName, tokenNumber }) => {
      // Ensure tokenNumber is stored as a number for consistent comparison
      const normalizedTokenNumber = typeof tokenNumber === 'number' ? tokenNumber : parseInt(tokenNumber, 10);

      // Store customer data with normalized token number
      activeConnections.customers.set(socket.id, { queueName, tokenNumber: normalizedTokenNumber });

      // Join the queue's room for broadcast messages
      socket.join(`queue:${queueName}`);

      // Emit confirmation to the customer
      socket.emit("customer:joined", {
        queueName,
        tokenNumber: normalizedTokenNumber,
        message: `You have joined the ${queueName} queue with token ${normalizedTokenNumber}`,
      });
    });

    // Staff member subscribes to specific queues
    socket.on("staff:subscribe", ({ queues }) => {
      // Verify authentication and role
      if (!socket.user) {
        socket.emit("error", {
          message: "Authentication required. Please provide a valid token.",
        });
        return;
      }

      if (socket.user.role !== "staff" && socket.user.role !== "admin") {
        socket.emit("error", {
          message: `Access denied. Staff or Admin role required. Your role: ${socket.user.role}`,
        });
        return;
      }

      console.log(
        `Staff ${socket.id} (${socket.user.email}) subscribed to queues:`,
        queues
      );

      // Store staff subscriptions
      activeConnections.staff.set(socket.id, queues);

      // Join each queue's room
      queues.forEach((queueName) => {
        socket.join(`queue:${queueName}`);
      });

      // Emit confirmation
      socket.emit("staff:subscribed", {
        queues,
        message: "Successfully subscribed to queues",
      });
    });

    // Admin subscribes to all updates
    socket.on("admin:subscribe", () => {
      // Verify authentication and role
      if (!socket.user) {
        socket.emit("error", {
          message: "Authentication required. Please provide a valid token.",
        });
        return;
      }

      if (socket.user.role !== "admin") {
        socket.emit("error", {
          message: `Access denied. Admin role required. Your role: ${socket.user.role}`,
        });
        return;
      }

      console.log(
        `Admin ${socket.id} (${socket.user.email}) subscribed to all updates`
      );

      // Store admin connection
      activeConnections.admins.set(socket.id, socket.id);

      // Join admin room
      socket.join("admin");

      // Emit confirmation
      socket.emit("admin:subscribed", {
        message: "Successfully subscribed to admin updates",
      });
    });

    // Disconnect handler
    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);

      // Clean up stored connections
      activeConnections.customers.delete(socket.id);
      activeConnections.staff.delete(socket.id);
      activeConnections.admins.delete(socket.id);
    });
  });

  // Export helper methods that can be used elsewhere to emit events
  return {
    // Called when a new token is being served
    emitTokenCalled: (queueName, tokenNumber) => {
      io.to(`queue:${queueName}`).emit("token:called", {
        queueName,
        tokenNumber,
        timestamp: new Date(),
      });

      // Also notify customers individually if their token is called
      for (const [socketId, data] of activeConnections.customers.entries()) {
        if (data.queueName === queueName && data.tokenNumber === tokenNumber) {
          io.to(socketId).emit("token:your-turn", {
            queueName,
            tokenNumber,
            message: `It's your turn! Your token ${tokenNumber} is now being served.`,
          });
        }
      }
    },

    // Called when queue status changes (new join, token called, pause/resume, reset)
    emitQueueUpdate: (queueName, updateData) => {
      io.to(`queue:${queueName}`).emit("queue:update", {
        queueName,
        ...updateData,
        timestamp: new Date(),
      });

      // Also send to admins
      io.to("admin").emit("queue:update", {
        queueName,
        ...updateData,
        timestamp: new Date(),
      });
    },
  };
};

module.exports = setupSocketIO;
