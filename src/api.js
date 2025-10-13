// src/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASEURL || "http://localhost:5000";
const api = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bl_token");
  console.log("API intercept -> token present:", !!token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

