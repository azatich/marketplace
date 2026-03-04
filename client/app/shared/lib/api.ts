import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  
  if (token) {
    if (!config.headers) {
      config.headers = {} as any; 
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
})