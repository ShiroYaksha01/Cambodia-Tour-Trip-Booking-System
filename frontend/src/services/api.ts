import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

//export service api
export const fetchServices = async () => {
  const res = await api.get("/services"); // adjust endpoint if needed
  return res.data;
};

export default api;

