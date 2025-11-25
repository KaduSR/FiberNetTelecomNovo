
import { DashboardResponse, LoginResponse, Task } from '../types/api';
import { API_BASE_URL, ENDPOINTS } from '../config';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Remove barra inicial extra se houver
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    // Monta a URL: /api-proxy + /api/auth/login
    // O Vercel vai transformar em: https://api.centralfiber.online/api/auth/login
    const url = `${cleanBaseUrl}${cleanEndpoint}`;
    
    // Timeout de segurança de 15s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(`[ApiService] Requesting: ${url}`); // Log para debug

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);

      // Tratamento de resposta
      const text = await response.text();
      let data: any;
      
      try {
          data = text ? JSON.parse(text) : {};
      } catch (e) {
          console.error(`[ApiService] Erro JSON. Status: ${response.status}. Resposta: ${text.substring(0, 100)}`);
          // Se receber HTML (como o erro 404), lança erro específico
          if (text.trim().startsWith('<')) {
             throw new Error(`Erro ${response.status}: Endpoint não encontrado ou erro de servidor.`);
          }
          throw new Error(`Erro de comunicação (Status ${response.status}).`);
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
        }
        const errorMessage = data.error || data.message || `Erro ${response.status}`;
        throw new Error(errorMessage);
      }

      return data as T;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`[ApiService] Erro:`, error);
      throw error;
    }
  }

  // === MÉTODOS USANDO AS CONSTANTES CORRETAS ===

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>(ENDPOINTS.LOGIN, { 
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>(ENDPOINTS.DASHBOARD, { 
      method: 'GET',
    });
  }

  async recoverPassword(email: string): Promise<{ message: string }> {
      return this.request<{ message: string }>(ENDPOINTS.RECOVERY, {
          method: 'POST',
          body: JSON.stringify({ email })
      });
  }

  async changePassword(newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async performLoginAction(loginId: number, action: string): Promise<any> {
    return this.request<any>(ENDPOINTS.LOGIN_ACTION(loginId, action), { 
      method: 'POST',
    });
  }

  async unlockTrust(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/desbloqueio-confianca', {
      method: 'POST',
    });
  }

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/api/tasks', { method: 'GET' });
  }

  async createTask(data: { title: string; description: string }): Promise<Task> {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeTask(taskId: string): Promise<any> {
    return this.request<any>(`/api/ai/analyze/${taskId}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
