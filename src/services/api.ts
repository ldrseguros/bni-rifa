import axios from "axios";

// Define a URL do backend com base no ambiente
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Cria uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL, // URL base do backend
  timeout: 10000, // Timeout das requisições em ms
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptador para adicionar o token de autenticação em requisições protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
