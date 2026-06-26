import client from './client';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (data) => client.post('/auth/register', data);
export const loginUser    = (data) => client.post('/auth/login', data);
export const getMe        = ()     => client.get('/auth/me');
export const updateMe     = (data) => client.patch('/auth/me', data);




export const getAnalyticsOverview = () => client.get('/analytics/overview');
export const getRevenueTrend = (months = 12) => client.get(`/analytics/revenue?months=${months}`);
export const getCampaignPerformance = (limit = 10) => client.get(`/analytics/campaigns?limit=${limit}`);
export const getCustomerHealth = () => client.get('/analytics/customers');

export const getCustomers = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, v); });
  return client.get(`/customers?${qs}`);
};
export const getCustomer = (id) => client.get(`/customers/${id}`);
export const getCustomerStats = () => client.get('/customers/stats');
export const createCustomer = (data) => client.post('/customers', data);
export const updateCustomer = (id, data) => client.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);
export const optOutCustomer = (id, channels) => client.post(`/customers/${id}/opt-out`, { channels });
export const optInCustomer = (id, channels) => client.post(`/customers/${id}/opt-in`, { channels });
export const getCustomerCampaignHistory = (id) => client.get(`/customers/${id}/campaign-history`);

export const getCampaigns = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, v); });
  return client.get(`/campaigns?${qs}`);
};
export const getCampaign = (id) => client.get(`/campaigns/${id}`);
export const getCampaignStats = () => client.get('/campaigns/stats');
export const getCampaignCommunications = (id, params = {}) => {
  const qs = new URLSearchParams(params);
  return client.get(`/campaigns/${id}/communications?${qs}`);
};
export const getCampaignAudiencePreview = (id) => client.get(`/campaigns/${id}/audience-preview`);
export const createCampaign = (data) => client.post('/campaigns', data);
export const sendCampaign = (id) => client.post(`/campaigns/${id}/send`, {});
export const cloneCampaign = (id, name) => client.post(`/campaigns/${id}/clone`, { name });
export const scheduleCampaign = (id, scheduledAt) => client.put(`/campaigns/${id}/schedule`, { scheduledAt });
export const unscheduleCampaign = (id) => client.delete(`/campaigns/${id}/schedule`);

export const getOrders = (params = {}) => {
  const qs = new URLSearchParams(params);
  return client.get(`/orders?${qs}`);
};
export const attributeOrder = (orderId, campaignId, communicationId) =>
  client.post('/orders/attribute', { orderId, campaignId, communicationId });

export const nlQuery = (prompt, execute = true) => client.post('/ai/query', { prompt, execute });
export const generateContent = (data) => client.post('/ai/generate-content', data);
export const queryAndGenerate = (data) => client.post('/ai/query-and-generate', data);
export const getAISuggestions = () => client.get('/ai/suggestions');
export const getSegmentPresets = (category) => client.get(`/ai/segments/presets${category ? `?category=${category}` : ''}`);
export const previewSegmentPreset = (id) => client.post(`/ai/segments/presets/${id}/preview`);
export const previewAudienceQuery = (id) => client.get(`/campaigns/${id}/audience-preview`);
