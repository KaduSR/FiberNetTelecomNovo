
export interface Cliente {
  id: number;
  nome: string;
  endereco?: string;
  cpn_cnpj?: string;
  fone?: string;
  email?: string;
  numero?: string;
}

export interface Contrato {
  id: number;
  id_cliente: number;
  login: string; 
  plano: string; 
  status: string; 
  desbloqueio_confianca: 'S' | 'N';
  descricao_aux_plano_venda?: string; 
  pdf_link?: string; 
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
}

export interface Fatura {
  id: number;
  id_cliente: number;
  contrato_id?: number;
  documento: string;
  data_emissao?: string;
  data_vencimento: string; 
  vencimento?: string; 
  valor: string;
  status: string; 
  linha_digitavel: string;
  pix_txid?: string;
  pix_code?: string;
  pix_qrcode?: string; 
  pix_imagem?: string; 
  boleto?: string;
  descricao?: string;
}

// New Types for Invoice Search
export interface BoletoSearchItem {
  id: number;
  clienteId: number;
  clienteNome: string;
  documento: string;
  vencimento: string;
  vencimentoFormatado: string;
  valor: number;
  valorFormatado: string;
  linhaDigitavel: string;
  pixCopiaECola?: string;
  boleto_pdf_link?: string;
  status: string;
  statusCor: string;
  diasVencimento: number;
}

export interface BoletoSearchResponse {
  success: boolean;
  cpfCnpj: string;
  resumo: {
    totalBoletos: number;
    totalEmAberto: number;
    totalEmAbertoFormatado: string;
    boletosVencidos: number;
    boletosAVencer: number;
  };
  boletos: BoletoSearchItem[];
}

export interface NotaFiscal {
    id: number | string;
    contrato_id?: number;
    numero_nota?: string;
    summary?: string; 
    insights?: any[]; 
    data_emissao?: string;
    valor?: string;
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
  contrato_id: number;
  online: 'S' | 'N';
  status?: string; 
  uptime?: string; 
  sinal_ultimo_atendimento: string;
  
  ont_modelo?: string;
  ont_sinal_rx?: string;
  ont_sinal_tx?: string;
  ont_temperatura?: string;
  ont_mac?: string;

  tempo_conectado: string;
  upload_atual?: string;
  download_atual?: string;
  ip_privado?: string;
  ip_publico?: string;
  
  history?: HistoryData; 
}

export interface Consumo {
  total_download_bytes: number;
  total_upload_bytes: number;
  total_download: string; 
  total_upload: string;
  history: HistoryData;
}

// Service Orders & Tickets
export interface OrdemServico {
  id: string;
  protocolo: string;
  tipo: string;
  assunto: string;
  mensagem: string;
  status: string;
  statusCor: string;
  dataAbertura: string;
  dataFechamento: string | null;
  endereco: string;
  resposta: string | null;
  podeAvaliar: boolean;
}

export interface TicketType {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
}

export interface TicketCreatePayload {
  assunto: string;
  mensagem: string;
  prioridade?: string;
  tipo?: string;
  contratoId?: number;
  loginId?: number;
}

export interface OntInfo {
  id: string;
  serial_number?: string;
  status?: string;
  sinal_rx?: string;
  sinal_tx?: string;
  temperatura?: string;
  mac?: string;
  onu_tipo?: string;
  id_login?: number | string;
}

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

export interface DashboardResponse {
  clientes: Cliente[];
  contratos: Contrato[];
  faturas: Fatura[];
  logins: Login[];
  notas: NotaFiscal[]; 
  ordensServico: OrdemServico[]; // Updated type
  ontInfo: OntInfo[];
  consumo: Consumo;
  ai_analysis?: AiAnalysis; 
}

export interface LoginResponse {
  token: string;
  user?: {
      id: number;
      nome: string;
      email: string;
  }
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    sources?: { title: string; url: string }[];
}
