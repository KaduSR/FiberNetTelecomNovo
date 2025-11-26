
export interface Cliente {
  id: number;
  nome: string;
  endereco?: string;
  cnpj_cpf?: string;
  fone?: string;
  email?: string;
  numero?: string;
}

export interface Contrato {
  id: number;
  id_cliente: number;
  login: string; // Geralmente o usuário PPPoE principal
  status: string; // 'A', 'S', 'C'
  desbloqueio_confianca: 'S' | 'N';
  descricao_aux_plano_venda?: string; // Nome do Plano
  pdf_link?: string; 
  // Novos campos para agrupamento visual
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
}

export interface Fatura {
  id: number;
  id_cliente: number;
  contrato_id?: number; // CAMPO CRÍTICO PARA O AGRUPAMENTO
  documento: string;
  data_emissao: string;
  data_vencimento: string;
  valor: string;
  status: 'A' | 'B' | 'C'; 
  linha_digitavel: string;
  pix_txid: string;
  boleto: string;
  descricao?: string;
}

export interface NotaFiscal {
    id: number;
    contrato_id?: number; // CAMPO CRÍTICO PARA O AGRUPAMENTO
    numero_nota: string;
    data_emissao: string;
    valor: string;
    link_pdf?: string;
}

export interface ConsumoPoint {
  data?: string;     
  mes_ano?: string;
  semana?: string;  
  download_bytes: number;
  upload_bytes: number;
}

export interface HistoryData {
  daily: ConsumoPoint[];
  weekly: ConsumoPoint[];
  monthly: ConsumoPoint[];
}

export interface Login {
  id: number;
  login: string;
  id_cliente: number;
  contrato_id: number; // CAMPO CRÍTICO PARA O AGRUPAMENTO
  online: 'S' | 'N';
  sinal_ultimo_atendimento: string; // Sinal ONT
  tempo_conectado: string;
  upload_atual?: string;
  download_atual?: string;
  // Campos de IP e Equipamento
  ip_privado?: string;
  ip_publico?: string;
  ont_modelo?: string;
  history?: HistoryData; // Histórico específico deste login
}

export interface Consumo {
  total_download_bytes: number;
  total_upload_bytes: number;
  total_download: string; 
  total_upload: string;
  history: HistoryData;
}

export interface OrdemServico {
  id: string;
  tipo: string;
  status: string;
  protocolo: string;
  data_abertura: string;
  mensagem: string;
}

export interface OntInfo {
  id: string;
  serial_number?: string;
  status?: string;
  sinal_rx?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status?: string;
  analysis?: string; 
  createdAt?: string;
}

// === NOVAS INTERFACES DE AI ===
export interface AiInsight {
  type: 'risk' | 'positive' | 'neutral';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

export interface AiAnalysis {
  summary: string;
  insights: AiInsight[];
}
// =============================

export interface DashboardResponse {
  clientes: Cliente[];
  contratos: Contrato[];
  faturas: Fatura[];
  logins: Login[];
  notas: NotaFiscal[]; 
  ordensServico: OrdemServico[];
  ontInfo: OntInfo[];
  consumo: Consumo;
  ai_analysis?: AiAnalysis; // Campo opcional para insights
}

export interface LoginResponse {
  token: string;
  user?: {
      id: number;
      nome: string;
      email: string;
  }
}

// Tipo para mensagens do Chat IA
export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    sources?: { title: string; url: string }[]; // Added for Search Grounding
}
