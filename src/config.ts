
export const getApiBaseUrl = () => {
  // Mantemos o proxy para evitar CORS e usar a configuração do vercel.json
  return '/api-proxy';
};

export const API_BASE_URL = getApiBaseUrl();

// CORREÇÃO: Adicionando os prefixos /api e /auth que faltavam
export const ENDPOINTS = {
  LOGIN: `/api/auth/login`,
  DASHBOARD: `/api/dashboard`,
  CHANGE_PASSWORD: `/api/auth/trocar-senha`,
  RECOVERY: `/api/auth/recuperar-senha`, 
  INVOICES: `/api/faturas`,
  SERVICE_STATUS: `/api/status`,
  SPEEDTEST_RUN: `/api/speedtest`,
  LOGIN_ACTION: (id: string | number, action: string) => `/api/logins/${id}/${action}`,
};
