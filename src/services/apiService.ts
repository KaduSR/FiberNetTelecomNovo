
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
    weekly: Array.from({length: 12}, (_, i) => {
      return {
        semana: `Semana ${i + 1}`,
        download_bytes: Math.random() * 35 * 1024 * 1024 * 1024 * multiplier,
        upload_bytes: Math.random() * 15 * 1024 * 1024 * 1024 * multiplier
      };
    }),
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
    const rawData = await this.request<any>(ENDPOINTS.DASHBOARD, { 
      method: 'GET',
    });

    // ✅ MAPEAMENTO CORRETO DOS DADOS DA API
    const normalized: DashboardResponse = {
      clientes: rawData.clientes || [],
      
      // ✅ FILTRAR APENAS CONTRATOS ATIVOS
      contratos: (rawData.contratos || [])
        .filter((c: any) => c.status === 'A')
        .map((c: any) => ({
          ...c,
          // Adicionar campos do cliente para contexto
          endereco: rawData.clientes[0]?.endereco || '',
          bairro: '', 
          cidade: '', 
        })),
      
      // ✅ NORMALIZAR FATURAS (APENAS EM ABERTO)
      faturas: (rawData.faturas || [])
        .filter((f: any) => f.status !== 'pago' && f.status !== 'P') 
        .map((f: any) => ({
          ...f,
          contrato_id: rawData.contratos[0]?.id, // Vincular ao primeiro contrato ativo como fallback
          data_vencimento: f.vencimento || f.data_vencimento,
          status: f.status === 'pago' ? 'C' : 'A', // Normalizar: 'A' = Aberto
          pix_code: f.pix_code || null,
          pix_qrcode: f.pix_qrcode || null,
          pix_txid: null, // Será buscado dinamicamente
        })),
      
      // ✅ NORMALIZAR LOGINS COM DADOS DA ONT
      logins: (rawData.logins || []).map((l: any) => {
        // Buscar dados da ONT correspondente
        const ont = (rawData.ontInfo || []).find((o: any) => 
          Number(o.id_login) === Number(l.id)
        );

        // Converter uptime de segundos para formato legível se for numérico
        let tempo_conectado = l.uptime || 'Recente';
        if (!isNaN(Number(l.uptime))) {
            const uptimeSeconds = parseInt(l.uptime || '0');
            const days = Math.floor(uptimeSeconds / 86400);
            const hours = Math.floor((uptimeSeconds % 86400) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            tempo_conectado = `${days}d ${hours}h ${minutes}m`;
        }

        return {
          ...l,
          contrato_id: l.contrato_id || rawData.contratos[0]?.id,
          online: l.status === 'online' || l.online === 'S' ? 'S' : 'N',
          sinal_ultimo_atendimento: ont?.sinal_rx || l.sinal_ont || 'N/A',
          tempo_conectado,
          ont_modelo: ont?.onu_tipo || l.modelo_ont || 'Não informado',
          ont_sinal_rx: ont?.sinal_rx,
          ont_sinal_tx: ont?.sinal_tx,
          ont_temperatura: ont?.temperatura,
          ont_mac: ont?.mac,
          ip_publico: l.ip_publico || 'Não disponível'
        };
      }),
      
      // ✅ FILTRAR NOTAS INVÁLIDAS
      notas: (rawData.notas || [])
        .filter((n: any) => n.id !== 'ai-insights' && !n.summary)
        .map((n: any) => ({
          ...n,
          contrato_id: rawData.contratos[0]?.id
        })),
      
      ordensServico: rawData.ordensServico || [],
      ontInfo: rawData.ontInfo || [],
      consumo: rawData.consumo || { 
        total_download_bytes: 0, 
        total_upload_bytes: 0, 
        total_download: '0 GB', 
        total_upload: '0 GB',
        history: { daily: [], weekly: [], monthly: [] }
      },
      ai_analysis: rawData.ai_analysis
    };

    return normalized;
  }

  // ✅ NOVO: Buscar PIX de uma fatura específica
  async getPixCode(faturaId: string | number): Promise<string> {
    try {
      const response = await this.request<any>(ENDPOINTS.GET_PIX, {
        method: 'POST',
        body: JSON.stringify({ id_areceber: String(faturaId) })
      });

      // Extrair QR Code do retorno da API
      return response?.pix?.qrCode?.qrcode || '';
    } catch (error) {
      console.error(`[ApiService] Erro ao buscar PIX da fatura ${faturaId}:`, error);
      throw error;
    }
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
}

export const apiService = new ApiService();
