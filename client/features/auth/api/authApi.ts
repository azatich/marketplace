import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // allow backend to set/read auth cookies
});