
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
// ... código anterior ...

export const ENDPOINTS = {
  LOGIN: `/api/auth/login`,          // Adicionado /api/auth
  DASHBOARD: `/api/dashboard`,       // Adicionado /api
  CHANGE_PASSWORD: `/api/trocar-senha`,
  RECOVERY: `/api/recuperar-senha`, 
  INVOICES: `/api/faturas`,
  SERVICE_STATUS: `/api/status`,
  SPEEDTEST_RUN: `/api/speedtest`,
  LOGIN_ACTION: (id: string | number, action: string) => `/api/logins/${id}/${action}`,
};
