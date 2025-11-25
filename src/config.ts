

// Centralized configuration for the application
// You can override this using the VITE_API_BASE_URL environment variable in .env or Vercel settings

// Safely determine API Base URL
// We check if import.meta.env exists before accessing it to prevent "Cannot read properties of undefined"
const getApiBaseUrl = () => {
  const _importMeta = import.meta as any;
  let url = 'https://api.centralfiber.online/api';

  if (typeof _importMeta !== 'undefined' && _importMeta.env && _importMeta.env.VITE_API_BASE_URL) {
    url = _importMeta.env.VITE_API_BASE_URL;
  }
  
  // Debug log to help identify connection issues in console
  console.log(`[${new Date().toISOString()}] [Config] API Base URL active:`, url);
  return url;
};

export const API_BASE_URL = getApiBaseUrl();

// Specific Endpoints
export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  CHANGE_PASSWORD: `${API_BASE_URL}/trocar-senha`,
  RECOVERY: `${API_BASE_URL}/recuperar-senha`, // Endpoint for password recovery
  INVOICES: `${API_BASE_URL}/faturas`,
  SERVICE_STATUS: `${API_BASE_URL}/status`, // Corrected: Removed /v1
  SPEEDTEST_RUN: `${API_BASE_URL}/speedtest`, // Corrected: Removed /v1 and /run
  // Logins actions
  LOGIN_ACTION: (id: string | number, action: string) => `${API_BASE_URL}/logins/${id}/${action}`,
};