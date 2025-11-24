
// Centralized configuration for the application
// You can override this using the VITE_API_BASE_URL environment variable in .env or Vercel settings

// Safely determine API Base URL
// We check if import.meta.env exists before accessing it to prevent "Cannot read properties of undefined"
const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'https://api.centralfiber.online/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Specific Endpoints
export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  CHANGE_PASSWORD: `${API_BASE_URL}/trocar-senha`,
  INVOICES: `${API_BASE_URL}/faturas`,
  SERVICE_STATUS: `${API_BASE_URL}/v1/status`,
  SPEEDTEST_RUN: `${API_BASE_URL}/v1/speedtest/run`,
  // Logins actions
  LOGIN_ACTION: (id: string | number, action: string) => `${API_BASE_URL}/logins/${id}/${action}`,
};
