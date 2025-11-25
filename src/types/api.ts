
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
  status: 'A' | 'B' | 'C'; 
  linha_digitavel: string;
  pix_txid: string;
  boleto: string;
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
  // NOVOS CAMPOS DE IP
  ip_privado?: string;
  ip_publico?: string;
}

export interface ConsumoPoint {
  data?: string;     // Para diário (ex: "2023-10-25")
  mes_ano?: string;  // Para mensal (ex: "2023-10")
  download_bytes: number;
  upload_bytes: number;
}

export interface Consumo {
  total_download_bytes: number;
  total_upload_bytes: number;
  // NOVOS CAMPOS FORMATADOS (Strings prontas do backend)
  total_download: string; 
  total_upload: string;
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
  analysis?: string; 
  createdAt?: string;
}

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

export interface LoginResponse {
  token: string;
  user?: {
      id: number;
      nome: string;
      email: string;
  }
}
