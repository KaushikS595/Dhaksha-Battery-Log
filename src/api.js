// src/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("API baseURL ->", baseURL);   // <— keep this her

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,  // ✅ VERY IMPORTANT
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bl_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;