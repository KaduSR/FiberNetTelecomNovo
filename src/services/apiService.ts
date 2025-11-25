import { DashboardResponse, LoginResponse } from '../types/api';
import { API_BASE_URL } from '../config';

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
    // Remove barra inicial duplicada se houver e garante formatação correta
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    
    console.log(`[ApiService] Requesting: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors', // Explicitly state CORS requirement
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      // Defensive JSON parsing: Check content type before parsing
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        // If response is not JSON (e.g. 502/504 HTML page), handle gracefully
        if (!response.ok) {
           // Try to get text if possible to log it
           const text = await response.text().catch(() => 'No body');
           console.error(`[ApiService] Non-JSON error response: ${text.substring(0, 100)}`);
           throw new Error(`Erro do Servidor (${response.status})`);
        }
        // If success but not JSON, return empty object or null (depending on T)
        data = {} as T; 
      }

      if (!response.ok) {
        // Se o token for inválido, limpa o storage
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
        }
        throw new Error(data.error || data.message || `Erro na requisição: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`[ApiService] Error on ${url}:`, error);
      
      // If it's a fetch error (Network/CORS), rethrow with a specific message if needed, 
      // or just let ClientArea handle 'Failed to fetch'
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          // Browser generic network error
          throw new Error('Falha de conexão com o servidor.');
      }
      
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  }

  async recoverPassword(email: string): Promise<{ message: string }> {
      return this.request<{ message: string }>('/recuperar-senha', {
          method: 'POST',
          body: JSON.stringify({ email })
      });
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/dashboard', {
      method: 'GET',
    });
  }

  async changePassword(newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/trocar-senha', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async performLoginAction(
    loginId: number, 
    action: 'limpar-mac' | 'desconectar' | 'diagnostico'
  ): Promise<any> {
    return this.request<any>(`/logins/${loginId}/${action}`, {
      method: 'POST',
    });
  }

  async unlockTrust(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/desbloqueio-confianca', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();