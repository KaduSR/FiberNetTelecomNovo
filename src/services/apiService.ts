
import { DashboardResponse, LoginResponse, Task, HistoryData } from '../types/api';
import { API_BASE_URL, ENDPOINTS } from '../config';

// Helper to generate mock history
const generateHistory = (multiplier: number): HistoryData => {
  return {
    daily: Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        download_bytes: Math.random() * 5 * 1024 * 1024 * 1024 * multiplier,
        upload_bytes: Math.random() * 2 * 1024 * 1024 * 1024 * multiplier
      };
    }),
    weekly: Array.from({length: 12}, (_, i) => ({
      semana: `Sem ${i + 1}`,
      download_bytes: Math.random() * 35 * 1024 * 1024 * 1024 * multiplier,
      upload_bytes: Math.random() * 15 * 1024 * 1024 * 1024 * multiplier
    })),
    monthly: [
      { mes_ano: "09/2024", download_bytes: 380 * 1024 * 1024 * 1024 * multiplier, upload_bytes: 180 * 1024 * 1024 * 1024 * multiplier },
      { mes_ano: "10/2024", download_bytes: 420 * 1024 * 1024 * 1024 * multiplier, upload_bytes: 200 * 1024 * 1024 * 1024 * multiplier },
      { mes_ano: "11/2024", download_bytes: 400 * 1024 * 1024 * 1024 * multiplier, upload_bytes: 200 * 1024 * 1024 * 1024 * multiplier },
      { mes_ano: "12/2024", download_bytes: 450 * 1024 * 1024 * 1024 * multiplier, upload_bytes: 220 * 1024 * 1024 * 1024 * multiplier },
      { mes_ano: "01/2025", download_bytes: 400 * 1024 * 1024 * 1024 * multiplier, upload_bytes: 200 * 1024 * 1024 * 1024 * multiplier },
      { mes_ano: "02/2025", download_bytes: 500 * 1024 * 1024 * 1024 * multiplier, upload_bytes: 250 * 1024 * 1024 * 1024 * multiplier }
    ]
  };
};

// === DADOS MOCKADOS PARA AMBIENTE DE DESENVOLVIMENTO ===
const MOCK_DASHBOARD: DashboardResponse = {
  clientes: [
    {
      id: 999,
      nome: "Desenvolvedor Fiber.Net",
      endereco: "Endereço Principal - Matriz",
      cnpj_cpf: "000.000.000-00",
      email: "dev@fibernet.com",
      fone: "(24) 99999-9999"
    }
  ],
  contratos: [
    // CONTRATO 1 - RESIDENCIAL
    {
      id: 1001,
      id_cliente: 999,
      login: "dev.casa",
      status: "A",
      desbloqueio_confianca: "N",
      descricao_aux_plano_venda: "PLANO FIBRA 500 MEGA",
      endereco: "Rua das Laranjeiras, 100",
      bairro: "Centro",
      cidade: "Rio das Flores",
      pdf_link: "#"
    },
    // CONTRATO 2 - COMERCIAL (PARA PROVAR O AGRUPAMENTO)
    {
      id: 1002,
      id_cliente: 999,
      login: "dev.loja",
      status: "A",
      desbloqueio_confianca: "N",
      descricao_aux_plano_venda: "PLANO EMPRESARIAL 1GB",
      endereco: "Av. do Comércio, 500",
      bairro: "Industrial",
      cidade: "Valença",
      pdf_link: "#"
    }
  ],
  logins: [
    // Login vinculado ao Contrato 1
    {
      id: 500,
      login: "dev.casa",
      id_cliente: 999,
      contrato_id: 1001,
      online: "S",
      sinal_ultimo_atendimento: "-18.50 dBm",
      tempo_conectado: "15d 4h 20m",
      ip_privado: "100.64.10.5",
      ont_modelo: "Huawei HG8145V5",
      history: generateHistory(1) // Normal usage
    },
    // Login vinculado ao Contrato 2
    {
      id: 501,
      login: "dev.loja",
      id_cliente: 999,
      contrato_id: 1002,
      online: "S",
      sinal_ultimo_atendimento: "-22.10 dBm",
      tempo_conectado: "2d 10h 05m",
      ip_privado: "100.64.20.10",
      ont_modelo: "ZTE F670L",
      history: generateHistory(2.5) // Heavy usage
    }
  ],
  faturas: [
    // Fatura do Contrato 1
    {
      id: 501,
      id_cliente: 999,
      contrato_id: 1001,
      documento: "FAT-RES-01",
      data_emissao: "2025-02-01",
      data_vencimento: "2025-02-10",
      valor: "99,90",
      status: "A", // Aberto
      linha_digitavel: "84670000001 4 99900099999 9 99999999999 9 99999999999 9",
      pix_txid: "pix-residencia-mock",
      boleto: "#"
    },
    // Fatura do Contrato 2
    {
      id: 502,
      id_cliente: 999,
      contrato_id: 1002,
      documento: "FAT-COM-01",
      data_emissao: "2025-02-05",
      data_vencimento: "2025-02-15",
      valor: "250,00",
      status: "A", // Aberto
      linha_digitavel: "84670000002 5 88800088888 8 88888888888 8 88888888888 8",
      pix_txid: "pix-comercial-mock",
      boleto: "#"
    }
  ],
  notas: [
    {
        id: 700,
        contrato_id: 1001,
        numero_nota: "2025001",
        data_emissao: "10/02/2025",
        valor: "99,90",
        link_pdf: "#"
    }
  ],
  ordensServico: [],
  ontInfo: [],
  consumo: {
    total_download_bytes: 536870912000, // 500 GB
    total_upload_bytes: 268435456000,   // 250 GB
    total_download: "500 GB",
    total_upload: "250 GB",
    history: generateHistory(3.5) // Combined usage
  },
  ai_analysis: {
    summary: "Sua saúde financeira está estável, mas requer atenção a curto prazo. Identificamos uma fatura próxima do vencimento e alto consumo de upload em horário comercial.",
    insights: [
      {
        type: 'risk',
        title: "Atenção: Vencimento Próximo",
        message: "A fatura de R$ 99,90 vence em 5 dias. Evite bloqueios e multas.",
        action: "Pagar Agora",
        actionUrl: "#"
      },
      {
        type: 'positive',
        title: "Excelente Pagador",
        message: "Você pagou suas últimas 6 faturas em dia! Isso melhora seu score interno."
      },
      {
        type: 'neutral',
        title: "Dica de Conexão",
        message: "Seu consumo de upload aumentou 20% esta semana. Ótimo para backups em nuvem!"
      }
    ]
  }
};

const DEV_TOKEN = "DEV_TOKEN_MOCK_123456";

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
    // === MOCK INTERCEPTOR ===
    const token = localStorage.getItem('authToken');
    if (token === DEV_TOKEN) {
        console.log(`[DEV MODE] Mocking request to: ${endpoint}`);
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Retornos Mockados baseados na rota
        if (endpoint.includes('dashboard')) return MOCK_DASHBOARD as unknown as T;
        if (endpoint.includes('logins')) return { message: "Comando executado com sucesso (DEV MODE)" } as unknown as T;
        if (endpoint.includes('trocar-senha')) return { message: "Senha alterada com sucesso (DEV MODE)" } as unknown as T;
        if (endpoint.includes('recuperar-senha')) return { message: "E-mail de recuperação enviado (DEV MODE)" } as unknown as T;
        if (endpoint.includes('status')) return { status: 'operational' } as unknown as T;
        
        return {} as T;
    }
    // ========================

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const url = `${cleanBaseUrl}${cleanEndpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(`[ApiService] Requesting: ${url}`); 

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);

      const text = await response.text();
      let data: any;
      
      try {
          data = text ? JSON.parse(text) : {};
      } catch (e) {
          console.error(`[ApiService] Erro JSON. Status: ${response.status}.`);
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

  // === MÉTODOS ===

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    // === DEV BACKDOOR ===
    if (credentials.email === 'dev@fibernet.com' && credentials.password === 'dev') {
        console.log("[ApiService] Login DEV realizado com sucesso.");
        const mockResponse = { 
            token: DEV_TOKEN,
            user: { id: 999, nome: "Dev User", email: "dev@fibernet.com" }
        };
        localStorage.setItem('authToken', DEV_TOKEN);
        return mockResponse;
    }
    // ====================

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
