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
    
    // Debug em desenvolvimento - Verificação segura de ambiente
    try {
        if (import.meta?.env?.DEV) {
            console.log(`[ApiService] Requesting: ${url}`);
        }
    } catch (e) {
        // Ignora erro de acesso ao env se não estiver disponível
    }

    try {
      const response = await fetch(url, {
        ...options,
        // mode: 'cors', // Removido para evitar conflitos com Proxy (same-origin)
        cache: 'no-store', // Importante: Evita cache de disco/memória do navegador em respostas JSON
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
          // 3. Se falhar, é provável que seja HTML (erro 404/500 do servidor web ou proxy)
          console.error(`[ApiService] Falha ao processar JSON. Status: ${response.status}. Resposta recebida (início): ${text.substring(0, 200)}`);
          
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
              // Verifica erro 404 especificamente
              if (response.status === 404) {
                 throw new Error('Endpoint não encontrado (404). Verifique se a URL da API está correta.');
              }
              throw new Error(`A API retornou HTML em vez de JSON (Status ${response.status}). Possível erro de servidor ou rota inexistente.`);
          }
          throw new Error('Resposta inválida do servidor (Não é JSON).');
      }

      // 4. Verifica status HTTP (ex: 400, 401, 500)
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
      
      // Tratamento específico para erros de rede (CORS, Offline, DNS)
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se a API está online.');
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

  // === TASKS & AI MODULE ===

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks', {
      method: 'GET'
    });
  }

  async createTask(data: { title: string; description: string }): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeTask(taskId: string): Promise<any> {
    return this.request<any>(`/ai/analyze/${taskId}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();