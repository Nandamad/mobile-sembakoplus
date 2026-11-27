import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sembakoplus.auth.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function saveAuthToken(token) {
  if (token) localStorage.setItem("sembakoplus.auth.token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("sembakoplus.auth.token");
}

export default api;
