
export const getApiBaseUrl = () => {
  // O prefixo /api é adicionado aqui pois seu backend serve em https://.../api/
  return '/api-proxy/api'; 
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  LOGIN: `/auth/login`,
  DASHBOARD: `/dashboard`,
  CHANGE_PASSWORD: `/senha/trocar`, // Updated per guide
  VALIDATE_PASSWORD: `/senha/validar`, // New
  RECOVERY: `/auth/recuperar-senha`, 
  INVOICES: `/faturas`, // Keep for legacy or dashboard internal
  SEARCH_INVOICES_CPF: `/boletos/buscar-cpf`, // New public endpoint
  SERVICE_STATUS: `/status`,
  SPEEDTEST_RUN: `/speedtest`,
  
  // Service Orders & Tickets
  SERVICE_ORDERS: `/ordens-servico`,
  SERVICE_ORDER_DETAIL: (id: string) => `/ordens-servico/${id}`,
  TICKETS: `/tickets`,
  TICKET_TYPES: `/tickets/tipos`,

  // Nova rota dinâmica para PIX
  GET_PIX: (id: number | string) => `/faturas/${id}/pix`, 
  LOGIN_ACTION: (id: string | number, action: string) => `/logins/${id}/${action}`,
};
