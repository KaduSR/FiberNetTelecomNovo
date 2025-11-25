
export interface Cliente {
  id: number;
  razao: string;
  cnpj_cpf: string;
  fone: string;
  email: string;
  endereco?: string;
  numero?: string;
}

export interface Contrato {
  id: number;
  id_cliente: number;
  login: string;
  status: string;
  desbloqueio_confianca: 'S' | 'N';
  descricao_aux_plano_venda?: string;
  pdf_link?: string; 
}

export interface Fatura {
  id: number;
  id_cliente: number;
  documento: string;
  data_emissao: string;
  data_vencimento: string;
  valor: string;
  status: 'A' | 'B' | 'C'; // Aberto, Baixado, Cancelado
  linha_digitavel: string;
  pix_txid: string;
  boleto: string; // Link PDF
}

export interface Login {
  id: number;
  login: string;
  id_cliente: number;
  online: 'S' | 'N';
  sinal_ultimo_atendimento: string;
  tempo_conectado: string;
  id_contrato: number;
  upload_atual?: string;
  download_atual?: string;
}

export interface ConsumoPoint {
  data?: string;     // Para diário
  mes_ano?: string;  // Para mensal
  download_bytes: number;
  upload_bytes: number;
}

export interface Consumo {
  total_download_bytes: number;
  total_upload_bytes: number;
  history: {
    daily: ConsumoPoint[];
    monthly: ConsumoPoint[];
  };
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
  analysis?: string; // Campo para o retorno da IA
  createdAt?: string;
}

// Resposta completa do Dashboard
export interface DashboardResponse {
  clientes: Cliente[];
  contratos: Contrato[];
  faturas: Fatura[];
  logins: Login[];
  notas: any[];
  ordensServico: OrdemServico[];
  ontInfo: OntInfo[];
  consumo: Consumo;
}

// Resposta de Autenticação
export interface LoginResponse {
  token: string;
}
