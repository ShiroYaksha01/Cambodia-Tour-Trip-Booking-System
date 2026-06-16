import axios from "axios";
import router from "../router";
import { clearAuthData, getAuthToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Attach JWT from localStorage if present.
api.interceptors.request.use((config) => {
  try {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore localStorage errors in non-browser environments
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const skipAuthRedirect = Boolean((error?.config as any)?.skipAuthRedirect);
    const isAuthRoute =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRoute && !skipAuthRedirect) {
      clearAuthData();
      const current = router.currentRoute.value;
      if (current.name !== "login") {
        router.push({ name: "login", query: { redirect: current.fullPath } });
      }
    }

    return Promise.reject(error);
  },
);

// Export service api
export const fetchServices = async () => {
  const res = await api.get("/services");
  return res.data;
};

export const fetchMyServices = async () => {
  const res = await api.get("/services/my");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

export const getProviderBookings = (params?: any) => api.get(`/provider/bookings`, { params });

export const checkInBooking = (id: string) =>
  api.patch(`/provider/bookings/${id}/check-in`);

export const getProviderProfile = () => api.get("/provider/profile");

export const updateProviderProfile = (data: any) =>
  api.patch("/provider/profile", data);

export const getProviderDetail = (id: string) => api.get(`/providers/${id}`);

export const getProviderDashboardStats = () => api.get(`/provider/dashboard-stats`);

export const getProviderInventoryMatrix = () => api.get(`/provider/inventory-matrix`);

export const createService = async (data: any) => {
  return await api.post('/services', data);
};

export const updateService = async (id: string, data: any) => {
  return await api.patch(`/services/${id}`, data);
};

export const deleteService = async (id: string) => {
  return await api.delete(`/services/${id}`);
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Get all services + inventory slots for the authenticated provider
 * GET /inventory/provider
 */
export const getProviderInventory = async () => {
  return await api.get('/inventory/provider');
};

/**
 * Batch apply pricing across services (calls per-service endpoint internally)
 * PUT /inventory/:serviceId/pricing
 */
export const applyPricingToService = (
  serviceId: string,
  startDate: string,
  endDate: string,
  markupPercentage: number,
) =>
  api.put(`/inventory/${serviceId}/pricing`, {
    startDate,
    endDate,
    markupPercentage,
  });

// ── Inventory API ──────────────────────────────────────────────

/**
 * Create a single inventory slot for a service
 * POST /inventory/:serviceId/slot
 */
export const createInventorySlot = (serviceId: string, slotData: any) =>
  api.post(`/inventory/${serviceId}/slot`, slotData);

/**
 * Create multiple inventory slots for a date range
 * POST /inventory/:serviceId/batch
 */
export const createBatchInventorySlots = (serviceId: string, batchData: any) =>
  api.post(`/inventory/${serviceId}/batch`, batchData);

/**
 * Get inventory matrix for a service in a date range
 * GET /inventory/:serviceId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getInventoryMatrix = (
  serviceId: string,
  startDate: string,
  endDate: string,
) =>
  api.get(`/inventory/${serviceId}`, {
    params: { startDate, endDate },
  });

/**
 * Get a single inventory slot
 * GET /inventory/slot/:slotId
 */
export const getInventorySlot = (slotId: string) =>
  api.get(`/inventory/slot/${slotId}`);

/**
 * Update an inventory slot
 * PUT /inventory/slot/:slotId
 */
export const updateInventorySlot = (slotId: string, updateData: any) =>
  api.put(`/inventory/slot/${slotId}`, updateData);

/**
 * Delete an inventory slot
 * DELETE /inventory/slot/:slotId
 */
export const deleteInventorySlot = (slotId: string) =>
  api.delete(`/inventory/slot/${slotId}`);

/**
 * Book slots (increment booked count when booking is confirmed)
 * POST /inventory/slot/:slotId/book
 */
export const bookInventorySlots = (slotId: string, quantity: number) =>
  api.post(`/inventory/slot/${slotId}/book`, { quantity });

/**
 * Cancel booking (decrement booked count when booking is cancelled)
 * POST /inventory/slot/:slotId/cancel
 */
export const cancelInventoryBooking = (slotId: string, quantity: number) =>
  api.post(`/inventory/slot/${slotId}/cancel`, { quantity });

/**
 * Apply dynamic pricing to a date range
 * PUT /inventory/:serviceId/pricing
 */
export const applyDynamicPricing = (
  serviceId: string,
  startDate: string,
  endDate: string,
  markupPercentage: number,
) =>
  api.put(`/inventory/${serviceId}/pricing`, {
    startDate,
    endDate,
    markupPercentage,
  });

/**
 * Set peak period flags for a date range
 * PUT /inventory/:serviceId/peak-period
 */
export const setPeakPeriod = (
  serviceId: string,
  startDate: string,
  endDate: string,
  isPeak: boolean,
) =>
  api.put(`/inventory/${serviceId}/peak-period`, {
    startDate,
    endDate,
    isPeak,
  });

export const getAdminDashboardSummary = () => api.get(`/admin/dashboard/summary`).then(res => res.data)

export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email: string, otp: string, newPassword: string) => api.post('/auth/reset-password', { email, otp, newPassword });

export const verifyEmail = (email: string, otp: string) => api.post('/auth/verify-email', { email, otp });
export const resendVerificationEmail = (email: string) => api.post('/auth/resend-verification', { email });

export default api;
