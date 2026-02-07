import api from './ApiService';

const AnalyticsService = {
  // Get analytics counts
  getAnalyticsCounts: () => {
    return api.get('/analytics/counts');
  },
};

export default AnalyticsService;