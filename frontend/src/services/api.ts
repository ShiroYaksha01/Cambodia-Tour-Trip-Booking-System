import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Development Interceptor for Admin Login
const originalPost = api.post;
api.post = async function (url, data, config) {
  if (url === "/auth/login") {
    const { email, password } = (data as any) || {};
    if (email === "admin@tourbooking.local" && password === "Admin123!@#") {
      console.log("Mocking admin login...");
      return {
        data: {
          success: true,
          message: "Login successful",
          token: "mock-dev-token",
          user: {
            id: "admin-id",
            username: "Admin",
            email: "admin@tourbooking.local",
            role: "admin"
          }
        }
      } as any;
    }
  }
  return originalPost.apply(this, [url, data, config]);
};

//export service api
export const fetchServices = async () => {
  const res = await api.get("/services");
  return res.data;
};

export default api;
