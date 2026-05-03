// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000",
// });

// export default api;

const API_URL = 'http://localhost:3000'

export async function fetchServices() {
  const response = await fetch(`${API_URL}/services`)

  if (!response.ok) {
    throw new Error('Failed to fetch services')
  }

  return response.json()
}
