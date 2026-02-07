import api from "./ApiService";

const QueueService = {
  // Create a new queue
  createQueue: (name) => {
    return api.post("/queues", { name });
  },

  // Get all queues
  getAllQueues: () => {
    return api.get("/queues");
  },

  // Get a specific queue status
  getQueueStatus: (name) => {
    return api.get(`/queues/${name}/status`);
  },

  // Join a queue
  joinQueue: (name, customerData) => {
    return api.post(`/queues/${name}/join`, customerData);
  },

  // Call next token
  callNextToken: (name) => {
    return api.post(`/queues/${name}/next`);
  },

  // Complete service for a token
  completeService: (name, tokenNumber) => {
    return api.post(`/queues/${name}/complete`, { tokenNumber });
  },

  // Get token status
  getTokenStatus: (name, tokenNumber, verificationKey) => {
    return api.get(`/queues/${name}/token/${tokenNumber}`, {
      params: { verificationKey }
    });
  },

  // List all tokens for a queue
  listQueueTokens: (name, filters = {}) => {
    return api.get(`/queues/${name}/tokens`, { params: filters });
  },

  // Mark a token as abandoned
  abandonToken: (name, tokenNumber) => {
    return api.post(`/queues/${name}/token/${tokenNumber}/abandon`);
  },

  // Pause a queue
  pauseQueue: (name) => {
    return api.post(`/queues/${name}/pause`);
  },

  // Resume a queue
  resumeQueue: (name) => {
    return api.post(`/queues/${name}/resume`);
  },

  // Reset a queue
  resetQueue: (name) => {
    return api.post(`/queues/${name}/reset`);
  },

  // Delete a queue
  deleteQueue: (name) => {
    return api.delete(`/queues/${name}`);
  },

  // Get logged-in user's active tokens
  getMyActiveTokens: () => {
    return api.get("/queues/my-tokens");
  },
};

export default QueueService;
