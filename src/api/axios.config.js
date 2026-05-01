import axios from "axios";
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("erp_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
 
export default api;
