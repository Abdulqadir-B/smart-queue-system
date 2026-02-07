import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import QueueService from "../services/QueueService";
import { logError } from "../utils/logger";

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all queues
  const fetchQueues = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await QueueService.getAllQueues();
      setQueues(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch queues");
      logError("Error fetching queues:", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Create a new queue
  const createQueue = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.createQueue(queueName);
      setQueues((prev) => [...prev, response.data.data]);
      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to create queue");
      logError("Error creating queue:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join a queue
  const joinQueue = async (queueName, customerData = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.joinQueue(queueName, customerData);
      // Update the queue's last token number
      setQueues((prev) =>
        prev.map((q) =>
          q.name === queueName
            ? { ...q, lastToken: response.data.data.token }
            : q
        )
      );
      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to join queue");
      logError("Error joining queue:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Call next token
  const callNext = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.callNextToken(queueName);
      // Update the queue's serving token number
      setQueues((prev) =>
        prev.map((q) =>
          q.name === queueName
            ? {
                ...q,
                servingToken: response.data.data?.serving || q.servingToken,
              }
            : q
        )
      );
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to call next token");
      logError("Error calling next token:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get queue status
  const getQueueStatus = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.getQueueStatus(queueName);
      // Update the queue status in state
      setQueues((prev) =>
        prev.map((q) =>
          q.name === queueName ? { ...q, ...response.data.data } : q
        )
      );
      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to get queue status");
      logError("Error getting queue status:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Pause a queue
  const pauseQueue = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.pauseQueue(queueName);
      // Update the queue's active status in state
      setQueues((prev) =>
        prev.map((q) => (q.name === queueName ? { ...q, isActive: false } : q))
      );
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to pause queue");
      logError("Error pausing queue:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resume a queue
  const resumeQueue = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.resumeQueue(queueName);
      // Update the queue's active status in state
      setQueues((prev) =>
        prev.map((q) => (q.name === queueName ? { ...q, isActive: true } : q))
      );
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to resume queue");
      logError("Error resuming queue:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset a queue
  const resetQueue = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.resetQueue(queueName);
      // Update the queue in state
      setQueues((prev) =>
        prev.map((q) =>
          q.name === queueName ? { ...q, lastToken: 0, servingToken: 0 } : q
        )
      );
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to reset queue");
      logError("Error resetting queue:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for queue updates
    socket.on("queue:update", (data) => {
      setQueues((prev) =>
        prev.map((q) => {
          if (q.name === data.queueName) {
            // Update queue with new data
            const updates = {};
            if (data.servingToken !== undefined)
              updates.servingToken = data.servingToken;
            if (data.lastToken !== undefined)
              updates.lastToken = data.lastToken;
            if (data.isActive !== undefined) updates.isActive = data.isActive;
            return { ...q, ...updates };
          }
          return q;
        })
      );
    });

    // Listen for token updates
    socket.on("token:called", (data) => {
      setQueues((prev) =>
        prev.map((q) =>
          q.name === data.queueName ? { ...q, servingToken: data.token } : q
        )
      );
    });

    return () => {
      socket.off("queue:update");
      socket.off("token:called");
    };
  }, [socket, isConnected]);

  // NOTE: fetchQueues is NOT called here on initial render
  // Components that need queues should call fetchQueues themselves
  // This prevents duplicate API calls and refresh loops

  // Get token status
  const getTokenStatus = async (queueName, tokenNumber, verificationKey) => {
    try {
      // Don't set loading here - it causes the component to unmount
      setError(null);
      const response = await QueueService.getTokenStatus(
        queueName,
        tokenNumber,
        verificationKey
      );
      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to get token status");
      logError("Error getting token status:", err);
      throw err;
    }
  };

  // Complete service for a token
  const completeService = async (queueName, tokenNumber) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.completeService(
        queueName,
        tokenNumber
      );

      // Update the queue's serving token if returned from API
      if (response.data.data && response.data.data.nextServing !== undefined) {
        setQueues((prev) =>
          prev.map((q) =>
            q.name === queueName
              ? { ...q, servingToken: response.data.data.nextServing }
              : q
          )
        );
      }

      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to complete service");
      logError("Error completing service:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // List tokens for a queue
  const listQueueTokens = async (queueName, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.listQueueTokens(queueName, filters);
      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to list tokens");
      logError("Error listing tokens:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Abandon a token
  const abandonToken = async (queueName, tokenNumber) => {
    try {
      setLoading(true);
      setError(null);
      const response = await QueueService.abandonToken(queueName, tokenNumber);
      return response.data.data;
    } catch (err) {
      setError(err.message || "Failed to abandon token");
      logError("Error abandoning token:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a queue
  const deleteQueue = async (queueName) => {
    try {
      setLoading(true);
      setError(null);
      await QueueService.deleteQueue(queueName);
      // Remove the deleted queue from state
      setQueues((prev) => prev.filter((q) => q.name !== queueName));
    } catch (err) {
      setError(err.message || "Failed to delete queue");
      logError("Error deleting queue:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <QueueContext.Provider
      value={{
        queues,
        loading,
        error,
        fetchQueues,
        createQueue,
        joinQueue,
        callNext,
        getQueueStatus,
        pauseQueue,
        resumeQueue,
        resetQueue,
        getTokenStatus,
        completeService,
        listQueueTokens,
        abandonToken,
        deleteQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};
