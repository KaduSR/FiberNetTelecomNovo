
// Centralized configuration for the application
// You can override this using the VITE_API_BASE_URL environment variable in .env or Vercel settings

// Safely determine API Base URL
const getApiBaseUrl = () => {
  // Use relative path '/api-proxy' to leverage the Proxy configured in vite.config.ts (Dev) and vercel.json (Prod).
  // This avoids CORS issues by making the browser think it's calling the same domain.
  console.log(`[Config] API Base URL active: /api-proxy (Proxy to Backend)`);
  return '/api-proxy';
};

export const API_BASE_URL = getApiBaseUrl();

// Specific Endpoints (Helpers)
export const ENDPOINTS = {
  LOGIN: `/login`,
  DASHBOARD: `/dashboard`,
  CHANGE_PASSWORD: `/trocar-senha`,
  RECOVERY: `/recuperar-senha`, 
  INVOICES: `/faturas`,
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  LOGIN_ACTION: (id: string | number, action: string) => `/logins/${id}/${action}`,
};
