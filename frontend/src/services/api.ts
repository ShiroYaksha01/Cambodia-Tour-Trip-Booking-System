import axios from "axios";
import router from "../router";
import { clearAuthData, getAuthToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

const LOCAL_PROVIDER_SERVICES_KEY = "mockProviderServices";
const LOCAL_PROVIDER_PROFILE_KEY = "mockProviderProfile";

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
  const res = await api.get("/services/my", { skipAuthRedirect: true } as any).catch(() => ({
    data: getLocalProviderServices(),
  }));
  return res.data;
};

export const getProviderBookings = (params?: any) => api.get(`/provider/bookings`, { params, skipAuthRedirect: true } as any).catch(async (err) => {
  // If the request fails (network error, auth missing, or server error), return a local mock for quick preview
  const isAuthError = err && err.response && (err.response.status === 401 || err.response.status === 403)
  const isNetworkError = err && !err.response

  if (isAuthError || isNetworkError) {
    return { data: mockProviderBookings() }
  }

  // For other errors, still fallback to mock to enable quick dev preview
  return { data: mockProviderBookings() }
})

export const checkInBooking = (id: string) =>
  api.patch(`/provider/bookings/${id}/check-in`, undefined, { skipAuthRedirect: true } as any).catch(() => ({
    data: { id, checkedIn: true },
  }));

export const getProviderProfile = () => api.get("/provider/profile", { skipAuthRedirect: true } as any).catch(() => ({
  data: getLocalProviderProfile(),
}));
export const updateProviderProfile = (data: any) =>
  api.patch("/provider/profile", data, { skipAuthRedirect: true } as any).catch(() => {
    const current = getLocalProviderProfile();
    const next = {
      ...current,
      companyName: data.companyName ?? current.companyName,
      description: data.description ?? current.description,
      facebookUrl: data.facebookUrl ?? current.facebookUrl,
      telegramUrl: data.telegramUrl ?? current.telegramUrl,
      bankAccountNumber: data.bankAccountNumber ?? current.bankAccountNumber,
      bankName: data.bankName ?? current.bankName,
      refundPolicy: data.refundPolicy ?? current.refundPolicy,
      guestRequirements: data.guestRequirements ?? current.guestRequirements,
      user: {
        ...current.user,
        email: data.email ?? current.user?.email,
        phoneNumber: data.phoneNumber ?? current.user?.phoneNumber,
      },
    };
    localStorage.setItem(LOCAL_PROVIDER_PROFILE_KEY, JSON.stringify(next));
    return { data: next };
  });

export const getProviderDetail = (id: string) => api.get(`/providers/${id}`);

export const getProviderDashboardStats = () => api.get(`/provider/dashboard-stats`).catch(() => ({
  data: {
    avgOccupancy: '84.2%',
    revpar: '$142.50',
    lowStockAlerts: '04',
    khmerNewYear: '98%',
  }
}))

export const getProviderInventoryMatrix = () => api.get(`/provider/inventory-matrix`).catch(() => ({
  data: [
    {
      id: '1',
      title: 'Angkor Wat Sunrise Premium',
      description: 'Daily Departure (4am)',
      price: 85,
      remaining: 19,
      total: 50,
      isClosed: false,
    },
    {
      id: '2',
      title: 'Floating Village Photography',
      description: 'Afternoon Boat Tour',
      price: 45,
      remaining: 14,
      total: 30,
      isClosed: false,
    },
    {
      id: '3',
      title: 'Khmer Cooking Masterclass',
      description: 'Limited to 12 Pax',
      price: 65,
      remaining: 7,
      total: 12,
      isClosed: false,
    },
  ]
}))

export const createService = (data: any) =>
  api.post('/services', data, { skipAuthRedirect: true } as any).catch(() => {
    const services = getLocalProviderServices();
    const created = normalizeLocalService({
      ...data,
      id: `local-${Date.now()}`,
      isActive: data.isActive ?? true,
    });
    localStorage.setItem(LOCAL_PROVIDER_SERVICES_KEY, JSON.stringify([created, ...services]));
    return { data: created };
  });

export const updateService = (id: string, data: any) =>
  api.patch(`/services/${id}`, data, { skipAuthRedirect: true } as any).catch(() => {
    const services = getLocalProviderServices();
    const updated = services.map((service) =>
      String(service.id) === String(id)
        ? normalizeLocalService({ ...service, ...data, id: service.id })
        : service,
    );
    localStorage.setItem(LOCAL_PROVIDER_SERVICES_KEY, JSON.stringify(updated));
    return { data: updated.find((service) => String(service.id) === String(id)) || null };
  });

export const deleteService = (id: string) =>
  api.delete(`/services/${id}`, { skipAuthRedirect: true } as any).catch(() => {
    const services = getLocalProviderServices().filter((service) => String(service.id) !== String(id));
    localStorage.setItem(LOCAL_PROVIDER_SERVICES_KEY, JSON.stringify(services));
    return { data: { success: true } };
  });

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
export const getProviderInventory = () =>
  api.get('/inventory/provider', { skipAuthRedirect: true } as any).catch(() => ({
    data: mockProviderInventory(),
  }));

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
  }, { skipAuthRedirect: true } as any).catch(() => ({
    data: { serviceId, startDate, endDate, markupPercentage, applied: true },
  }));

// ── Inventory API ──────────────────────────────────────────────

/**
 * Create a single inventory slot for a service
 * POST /inventory/:serviceId/slot
 */
export const createInventorySlot = (serviceId: string, slotData: any) =>
  api.post(`/inventory/${serviceId}/slot`, slotData, { skipAuthRedirect: true } as any).catch(() => ({
    data: { id: `local-slot-${Date.now()}`, serviceId, ...slotData },
  }));

/**
 * Create multiple inventory slots for a date range
 * POST /inventory/:serviceId/batch
 */
export const createBatchInventorySlots = (serviceId: string, batchData: any) =>
  api.post(`/inventory/${serviceId}/batch`, batchData, { skipAuthRedirect: true } as any).catch(() => ({
    data: { serviceId, ...batchData, created: true },
  }));

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
  api.put(`/inventory/slot/${slotId}`, updateData, { skipAuthRedirect: true } as any).catch(() => ({
    data: { id: slotId, ...updateData },
  }));

/**
 * Delete an inventory slot
 * DELETE /inventory/slot/:slotId
 */
export const deleteInventorySlot = (slotId: string) =>
  api.delete(`/inventory/slot/${slotId}`, { skipAuthRedirect: true } as any).catch(() => ({
    data: { id: slotId, deleted: true },
  }));

/**
 * Book slots (increment booked count when booking is confirmed)
 * POST /inventory/slot/:slotId/book
 */
export const bookInventorySlots = (slotId: string, quantity: number) =>
  api.post(`/inventory/slot/${slotId}/book`, { quantity }, { skipAuthRedirect: true } as any).catch(() => ({
    data: { id: slotId, quantity, booked: true },
  }));

/**
 * Cancel booking (decrement booked count when booking is cancelled)
 * POST /inventory/slot/:slotId/cancel
 */
export const cancelInventoryBooking = (slotId: string, quantity: number) =>
  api.post(`/inventory/slot/${slotId}/cancel`, { quantity }, { skipAuthRedirect: true } as any).catch(() => ({
    data: { id: slotId, quantity, cancelled: true },
  }));

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
  }, { skipAuthRedirect: true } as any).catch(() => ({
    data: { serviceId, startDate, endDate, markupPercentage, applied: true },
  }));

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
  }, { skipAuthRedirect: true } as any).catch(() => ({
    data: { serviceId, startDate, endDate, isPeak },
  }));

function mockProviderBookings() {
  return [
    {
      id: 101,
      service_name: 'Angkor Temple Tour',
      user: { id: 11, name: 'Jane Doe', email: 'jane@example.com', phone_number: '+85512345678' },
      quantity: 2,
      date: new Date().toISOString(),
      payment_status: 'paid',
      amount: 120.0,
    },
    {
      id: 102,
      service_name: 'Phnom Penh City Walk',
      user: { id: 12, name: 'John Smith', email: 'john@example.com' },
      quantity: 1,
      date: new Date(Date.now() - 86400_000).toISOString(),
      payment_status: 'pending',
      amount: 45.0,
    },
  ]
}

function mockProviderServices() {
  return [
    {
      id: "mock-tour-1",
      title: "Angkor Sunrise Premium",
      description: "Daily sunrise temple tour with a local guide.",
      location: "Siem Reap",
      price: 85,
      serviceType: "tour",
      isActive: true,
      coverImage: "",
    },
    {
      id: "mock-transport-1",
      title: "Private Airport Transfer",
      description: "Comfortable transfer between airport and hotel.",
      location: "Phnom Penh",
      price: 28,
      serviceType: "transportation",
      isActive: true,
      coverImage: "",
    },
  ];
}

function getLocalProviderServices() {
  try {
    const raw = localStorage.getItem(LOCAL_PROVIDER_SERVICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeLocalService);
    }
  } catch {
    // Fall back to seeded mock data below.
  }

  const seeded = mockProviderServices().map(normalizeLocalService);
  try {
    localStorage.setItem(LOCAL_PROVIDER_SERVICES_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore storage failures.
  }
  return seeded;
}

function normalizeLocalService(service: any) {
  const serviceType = service.serviceType || service.type || "tour";
  return {
    id: service.id,
    title: service.title || service.name || "Untitled Service",
    description: service.description || "",
    location: service.location || "",
    price: Number(service.price) || 0,
    isActive: service.isActive ?? service.status !== "draft",
    coverImage: service.coverImage || service.image || "",
    ...service,
    serviceType,
  };
}

function getLocalProviderProfile() {
  const fallback = {
    companyName: "Anajak Tour Provider",
    description: "Verified local travel provider.",
    user: {
      email: "provider@anajaktour.local",
      phoneNumber: "+855 12 345 678",
    },
    facebookUrl: "fb.com/yourbrand",
    telegramUrl: "@brand_support",
    bankAccountNumber: "Not set",
    bankName: "Not set",
    refundPolicy: "",
    guestRequirements: "",
    logo: "",
  };

  try {
    const raw = localStorage.getItem(LOCAL_PROVIDER_PROFILE_KEY);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {
    // Use fallback profile.
  }

  return fallback;
}

function mockProviderInventory() {
  const today = new Date();
  const toDate = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return date.toISOString().slice(0, 10);
  };

  return mockProviderServices().map((service, serviceIndex) => ({
    ...service,
    slots: Array.from({ length: 5 }, (_, index) => ({
      id: `${service.id}-slot-${index}`,
      date: toDate(index),
      availableSlots: Math.max(3, 24 - index * 3 - serviceIndex * 2),
      price: Number(service.price) + index * 3,
      status: index === 3 ? "low_stock" : index === 4 ? "peak_demand" : "available",
    })),
  }));
}

export const getAdminDashboardSummary = () => api.get(`/admin/dashboard/summary`).then(res => res.data)

export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email: string, otp: string, newPassword: string) => api.post('/auth/reset-password', { email, otp, newPassword });

export const verifyEmail = (email: string, otp: string) => api.post('/auth/verify-email', { email, otp });
export const resendVerificationEmail = (email: string) => api.post('/auth/resend-verification', { email });

export default api;
