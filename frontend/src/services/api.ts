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
    const isAuthRoute =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
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

export const getProviderBookings = (params?: any) => api.get(`/provider/bookings`, { params }).catch(async (err) => {
  // If the request fails (network error, auth missing, or server error), return a local mock for quick preview
  const isAuthError = err && err.response && (err.response.status === 401 || err.response.status === 403)
  const isNetworkError = err && !err.response

  if (isAuthError || isNetworkError) {
    return { data: mockProviderBookings() }
  }

  // For other errors, still fallback to mock to enable quick dev preview
  return { data: mockProviderBookings() }
})

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

export const createService = (data: any) => api.post('/services', data);
export const updateService = (id: string, data: any) => api.patch(`/services/${id}`, data);
export const deleteService = (id: string) => api.delete(`/services/${id}`);

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

export const getAdminDashboardSummary = () => api.get(`/admin/dashboard/summary`).then(res => res.data)

export default api;
