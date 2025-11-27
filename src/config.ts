
export const getApiBaseUrl = () => {
  // O prefixo /api é adicionado aqui pois seu backend serve em https://.../api/
  return '/api-proxy/api'; 
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  LOGIN: `/auth/login`,
  DASHBOARD: `/dashboard`,
  CHANGE_PASSWORD: `/auth/trocar-senha`,
  RECOVERY: `/auth/recuperar-senha`, 
  INVOICES: `/faturas`,
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  // Nova rota dinâmica para PIX
  GET_PIX: (id: number | string) => `/faturas/${id}/pix`, 
  LOGIN_ACTION: (id: string | number, action: string) => `/logins/${id}/${action}`,
};