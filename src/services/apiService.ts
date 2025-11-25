import { DashboardResponse, LoginResponse, Task } from '../types/api';
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
    // Garante que não haja barras duplicadas
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Remove barra final da Base URL se houver para evitar duplicidade
    const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const url = `${cleanBaseUrl}${cleanEndpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      // 1. Obtém o texto bruto primeiro para debug em caso de erro de JSON
      const text = await response.text();
      
      let data: any;
      try {
          // 2. Tenta fazer o parse do JSON
          data = text ? JSON.parse(text) : {};
      } catch (e) {
          console.error(`[ApiService] Erro JSON. Status: ${response.status}. Resposta: ${text.substring(0, 200)}`);
          throw new Error(`Erro de comunicação com o servidor (Status ${response.status}). Verifique a conexão.`);
      }

      // 3. Verifica status HTTP (ex: 400, 401, 500)
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
        }
        // Usa a mensagem de erro da API se disponível, senão usa statusText
        const errorMessage = data.error || data.message || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data as T;
      
    } catch (error: any) {
      console.error(`[ApiService] Erro na requisição para ${url}:`, error);
      throw error;
    }
  }

  // === ROTAS DE AUTENTICAÇÃO ===

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    // Rota backend: /api/auth/login
    const data = await this.request<LoginResponse>('/api/auth/login', { 
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  }

  async recoverPassword(email: string): Promise<{ message: string }> {
      return this.request<{ message: string }>('/api/auth/recuperar-senha', {
          method: 'POST',
          body: JSON.stringify({ email })
      });
  }

  async changePassword(newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/trocar-senha', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  // === ROTAS DO CLIENTE ===

  async getDashboard(): Promise<DashboardResponse> {
    // Rota backend: /api/dashboard
    return this.request<DashboardResponse>('/api/dashboard', { 
      method: 'GET',
    });
  }

  async performLoginAction(
    loginId: number, 
    action: 'limpar-mac' | 'desconectar' | 'diagnostico'
  ): Promise<any> {
    return this.request<any>(`/api/logins/${loginId}/${action}`, {
      method: 'POST',
    });
  }

  async unlockTrust(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/desbloqueio-confianca', {
      method: 'POST',
    });
  }

  // === TASKS & AI MODULE ===

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