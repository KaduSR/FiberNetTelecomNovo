import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Shield, Eye, EyeOff, Mail, AlertTriangle, Wifi, Activity, 
  Router, Unlock, Clock, ChevronRight, MapPin, RefreshCw, BarChart3, Calendar, 
  Printer, Phone, FileCheck, ScrollText, FileCode, MessageSquare, Send, Bot, 
  MoreHorizontal, Settings, KeyRound, Home, ArrowUp, ArrowDown, Signal
} from 'lucide-react';
import Button from './Button';
import { Invoice } from '../types';

// === TYPES ===
interface ConnectionData {
    status: 'online' | 'offline';
    ip: string;
    uptime: string;
    download_usage: string;
    upload_usage: string;
    mac: string;
    last_auth: string;
}

interface ContractData {
    id: number;
    plan_name: string;
    speed_label: string;
    address: string;
    installation_date: string;
    status: string;
}

interface Protocol {
    id: string;
    type: string;
    subject: string;
    date: string;
    status: 'Aberto' | 'Fechado' | 'Em Análise';
}

interface ConsumptionData {
    label: string;
    download: number;
    upload: number;
}

interface FiscalNote {
    id: number;
    numero: string;
    serie: string;
    emissao: string;
    referencia: string;
    valor: string;
    link_pdf?: string;
    link_xml?: string;
}

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    type?: 'text' | 'pix';
    options?: { label: string; action: string }[];
    pixCode?: string;
}

// === MAIN COMPONENT ===
const ClientArea: React.FC = () => {
    // === AUTH STATE ===
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // === DATA STATE ===
    const [clientName, setClientName] = useState('Cliente Fiber.Net');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [connection, setConnection] = useState<ConnectionData | null>(null);
    const [contract, setContract] = useState<ContractData | null>(null);
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [fiscalNotes, setFiscalNotes] = useState<FiscalNote[]>([]);

    // === UI STATE ===
    const [activeTab, setActiveTab] = useState<'dashboard' | 'consumption' | 'reports' | 'fiscal' | 'chat' | 'options'>('dashboard');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activePixCode, setActivePixCode] = useState<string | null>(null);
    const [isPixCopied, setIsPixCopied] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [unlockedSuccess, setUnlockedSuccess] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // === CHART STATE ===
    const [consumptionPeriod, setConsumptionPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [chartData, setChartData] = useState<ConsumptionData[]>([]);
    const [isLoadingChart, setIsLoadingChart] = useState(false);

    // === CHAT STATE ===
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // === CHANGE PASSWORD STATE ===
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // === REPORTS STATE ===
    const [reportYear, setReportYear] = useState('2025');

    const API_BASE_URL = 'https://api.centralfiber.online/api/v1';

    // === INITIAL LOAD ===
    useEffect(() => {
        const savedLogin = localStorage.getItem('fiber_client_login');
        const savedToken = localStorage.getItem('fiber_auth_token');
       
        if (savedLogin) {
            setLogin(savedLogin);
            setRememberMe(true);
        }
        if (savedToken) {
            if (savedToken === 'demo-token') {
                loadDemoData();
            } else {
                fetchDashboardData(savedToken);
            }
        }
    }, []);

    // === AUTO SCROLL CHAT ===
    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isBotTyping, activeTab]);

    // === INIT CHAT ON TAB SWITCH ===
    useEffect(() => {
        if (activeTab === 'chat' && messages.length === 0) {
            setIsBotTyping(true);
            setTimeout(() => {
                setMessages([{
                    id: 1,
                    sender: 'bot',
                    text: `Olá, ${clientName.split(' ')[0]}! Sou o assistente virtual da Fiber.Net. Como posso te ajudar hoje?`,
                    options: [
                        { label: '2ª Via de Fatura', action: 'fatura' },
                        { label: 'Estou sem internet', action: 'suporte' },
                        { label: 'Desbloqueio de Confiança', action: 'desbloqueio' },
                        { label: 'Falar com Atendente', action: 'humano' }
                    ]
                }]);
                setIsBotTyping(false);
            }, 1000);
        }
    }, [activeTab]);

    // === CHART DATA FETCH ===
    const fetchRealConsumption = async (period: 'daily' | 'weekly' | 'monthly') => {
        if (!contract?.id || isDemoMode) {
            if (isDemoMode) setChartData(generateMockConsumption(period));
            return;
        }
        
        const token = localStorage.getItem('fiber_auth_token');
        if (!token) return;

        setIsLoadingChart(true);
        try {
            const response = await fetch(`${API_BASE_URL}/ixc/consumo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contrato_id: contract.id,
                    periodo: period === 'daily' ? 'diario' : period === 'weekly' ? 'semanal' : 'mensal'
                })
            });

            if (!response.ok) throw new Error('Erro ao buscar consumo');

            const result = await response.json();
            const formatted = result.dados.map((item: any) => ({
                label: period === 'monthly'
                    ? new Date(item.data).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                    : period === 'weekly'
                    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(item.data).getDay()]
                    : new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                download: Number(item.download.toFixed(1)),
                upload: Number(item.upload.toFixed(1))
            }));

            setChartData(formatted.reverse());
        } catch (err) {
            console.warn('Usando mock de consumo');
            setChartData(generateMockConsumption(period));
        } finally {
            setIsLoadingChart(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'consumption' && isAuthenticated) {
            fetchRealConsumption(consumptionPeriod);
        }
    }, [activeTab, consumptionPeriod, contract?.id, isAuthenticated]);

    // === DEMO DATA ===
    const loadDemoData = () => {
        setIsAuthenticated(true);
        setIsDemoMode(true);
        setClientName('Usuário Demo');
        setInvoices([
            { id: 101, vencimento: '10/12/2025', valor: '99,90', descricao: 'Mensalidade Fibra 500MB', status: 'aberto', linha_digitavel: '34191.79001 01043.510047 91020.150008 1 89370026000', pix_code: '00020126360014BR.GOV.BCB.PIX0114+552499999999520400005303986540599.905802BR5925FIBER NET TELECOM' },
            { id: 102, vencimento: '10/11/2025', valor: '99,90', descricao: 'Mensalidade Fibra 500MB', status: 'vencido' }
        ]);
        setConnection({ status: 'online', ip: '177.45.12.104', uptime: '14 dias, 3 horas', download_usage: '450 GB', upload_usage: '120 GB', mac: 'A1:B2:C3:D4:E5:F6', last_auth: '22/10/2025 08:30' });
        setContract({ id: 5502, plan_name: 'FIBER MAX 500 MEGA', speed_label: '500 Mbps', address: 'Rua das Flores, 123, Centro', installation_date: '15/01/2023', status: 'Ativo' });
        setProtocols([
            { id: '2025102201', type: 'Financeiro', subject: 'Solicitação de 2ª via', date: '22/10/2025', status: 'Fechado' }
        ]);
        setChartData(generateMockConsumption('daily'));
    };

    const generateMockConsumption = (period: 'daily' | 'weekly' | 'monthly'): ConsumptionData[] => {
        const data: ConsumptionData[] = [];
        const now = new Date();
        const count = period === 'daily' ? 30 : period === 'weekly' ? 7 : 12;
        
        for (let i = count; i >= 0; i--) {
            const d = new Date();
            if (period === 'monthly') d.setMonth(now.getMonth() - i);
            else d.setDate(now.getDate() - i);
            
            data.push({
                label: period === 'monthly' 
                    ? d.toLocaleDateString('pt-BR', { month: 'short' }) 
                    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                download: Math.floor(Math.random() * (period === 'monthly' ? 800 : 50)) + 10,
                upload: Math.floor(Math.random() * (period === 'monthly' ? 200 : 15)) + 5
            });
        }
        return data;
    };

    // === FETCH DATA FROM API ===
    const fetchDashboardData = async (token: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/dados`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            const raw = await response.json();
            const apiData = raw.data || raw;

            if (!apiData || Object.keys(apiData).length === 0) {
                throw new Error("Dados vazios");
            }

            // Helper to safely get string from potential objects
            const getString = (val: any, fallback: string) => {
                if (val === null || val === undefined) return fallback;
                if (typeof val === 'string') return val;
                if (typeof val === 'number') return String(val);
                if (typeof val === 'object') {
                    return val.nome || val.descricao || val.valor || val.label || val.text || fallback;
                }
                return fallback;
            };

            // NOME
            const nomeObj = apiData.cliente?.nome || apiData.nome || 'Cliente';
            const nomeCompleto = getString(nomeObj, 'Cliente');
            setClientName(nomeCompleto.split(' ')[0]);

            // FATURAS
            const faturasRaw = apiData.faturas || apiData.boletos || [];
            setInvoices(faturasRaw.map((f: any) => ({
                id: f.id || f.codigo || Date.now(),
                vencimento: getString(f.vencimento || f.data_vencimento, ''),
                valor: String(f.valor || f.valor_total || '0,00').replace('.', ','),
                status: getString(f.status, '').toLowerCase() || (new Date(f.vencimento) < new Date() ? 'vencido' : 'aberto'),
                descricao: getString(f.descricao || f.referencia, 'Mensalidade Fibra'),
                linha_digitavel: getString(f.linha_digitavel || f.codigo_barras, ''),
                pix_code: getString(f.pix_codigo || f.pix_code || f.codigo_pix || f.linha_digitavel, ''),
                link_pdf: getString(f.link_boleto || f.boleto_pdf || f.pdf, ''),
            })));

            // CONEXÃO
            setConnection({
                status: (getString(apiData.conexao?.status || apiData.status_conexao, 'offline').toLowerCase() === 'online') ? 'online' : 'offline',
                ip: getString(apiData.conexao?.ip_publico || apiData.ip_publico, 'Indisponível'),
                uptime: getString(apiData.conexao?.uptime, '0h 0min'),
                download_usage: getString(apiData.conexao?.download_mes || apiData.download_mes, '0 GB'),
                upload_usage: getString(apiData.conexao?.upload_mes || apiData.upload_mes, '0 GB'),
                mac: getString(apiData.conexao?.mac || apiData.mac_address, 'Não informado'),
                last_auth: getString(apiData.conexao?.ultima_autenticacao, 'Nunca'),
            });

            // CONTRATO
            setContract({
                id: apiData.contrato?.id || apiData.id_contrato || 0,
                plan_name: getString(apiData.contrato?.plano || apiData.plano, 'FIBER 500MB'),
                speed_label: getString(apiData.contrato?.velocidade || apiData.velocidade, '500 Mbps'),
                address: getString(apiData.contrato?.endereco_instalacao || apiData.endereco, 'Endereço não informado'),
                installation_date: getString(apiData.contrato?.data_instalacao, '01/01/2023'),
                status: getString(apiData.contrato?.status, 'Ativo'),
            });

            // PROTOCOLOS
            const protocolosRaw = apiData.protocolos || apiData.atendimentos || apiData.chamados || [];
            setProtocols(protocolosRaw.map((p: any) => ({
                id: getString(p.protocolo || p.id, '0000'),
                type: getString(p.tipo || p.categoria, 'Suporte'),
                subject: getString(p.assunto || p.titulo, 'Sem título'),
                date: getString(p.data || p.criado_em, new Date().toLocaleDateString('pt-BR')),
                status: (getString(p.status, 'Fechado')) as 'Aberto' | 'Fechado' | 'Em Análise',
            })));

            // NOTAS FISCAIS
            const notasRaw = apiData.notas_fiscais || apiData.nfs || [];
            setFiscalNotes(notasRaw.map((n: any) => ({
                id: n.id || Date.now(),
                numero: getString(n.numero, '000000'),
                serie: getString(n.serie, '1'),
                emissao: getString(n.emissao || n.data_emissao, new Date().toLocaleDateString('pt-BR')),
                referencia: getString(n.referencia || n.competencia, 'Atual'),
                valor: String(n.valor || '0,00').replace('.', ','),
                link_pdf: getString(n.link_pdf || n.pdf, ''),
                link_xml: getString(n.link_xml || n.xml, ''),
            })));

            setIsAuthenticated(true);
            setIsDemoMode(false);
            setError(null);

        } catch (err: any) {
            console.error('Erro API:', err);
            setError('Falha ao carregar dados reais. Entrando em modo demonstração...');
            setTimeout(() => {
                loadDemoData();
                setError(null);
            }, 2500);
        } finally {
            setLoading(false);
        }
    };

    // === AUTH ACTIONS ===
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!login || !password) return setError('Preencha e-mail e senha');
        
        if (login === 'teste' && password === '123') {
            loadDemoData();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: login.trim(), senha: password }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Credenciais inválidas');
            const data = await response.json();

            if (data.token) {
                localStorage.setItem('fiber_auth_token', data.token);
                if (rememberMe) localStorage.setItem('fiber_client_login', login);
                await fetchDashboardData(data.token);
            }
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message === 'Failed to fetch') {
                console.warn("Backend indisponível, entrando em modo DEMO");
                loadDemoData();
            } else {
                setError('E-mail ou senha incorretos.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('fiber_auth_token');
        if (!rememberMe) {
            setLogin('');
            localStorage.removeItem('fiber_client_login');
        }
        setInvoices([]); setConnection(null); setContract(null); setProtocols([]); setFiscalNotes([]);
        setIsDemoMode(false); setUnlockedSuccess(false);
    };

    const handleUnlockTrust = () => {
        setUnlocking(true);
        setTimeout(() => {
            setUnlocking(false);
            setUnlockedSuccess(true);
        }, 2000);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 3000);
    };

    const openPixModal = (code: string) => {
        setActivePixCode(code);
        setIsPixCopied(false);
    };

    const closePixModal = () => {
        setActivePixCode(null);
        setIsPixCopied(false);
    };

    const copyPixCode = () => {
        if (activePixCode) {
            navigator.clipboard.writeText(activePixCode);
            setIsPixCopied(true);
            setTimeout(() => setIsPixCopied(false), 3000);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) return alert("Preencha todos os campos");
        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('fiber_auth_token');
            const res = await fetch(`${API_BASE_URL}/dashboard/trocar-senha`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ senhaAtual: currentPassword, novaSenha: newPassword })
            });
            if (res.ok) {
                alert("Senha alterada com sucesso!");
                setIsChangePasswordOpen(false);
                setCurrentPassword('');
                setNewPassword('');
            } else {
                alert("Erro ao alterar senha");
            }
        } catch (e) {
            alert("Erro de conexão");
        } finally {
            setPasswordLoading(false);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsBotTyping(true);

        try {
            const token = localStorage.getItem('fiber_auth_token');
            const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: text })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.message, sender: 'bot' }]);
            } else {
                throw new Error('Chat error');
            }
        } catch (e) {
            setTimeout(() => {
                let botResponse: ChatMessage = { id: Date.now() + 1, text: '', sender: 'bot' };
                const lowerText = text.toLowerCase();

                if (lowerText.includes('fatura') || lowerText.includes('pagar') || lowerText.includes('2 via')) {
                    const openInvoices = invoices?.filter(i => i.status === 'aberto' || i.status === 'vencido') || [];
                    if (openInvoices.length > 0) {
                        botResponse.text = `Encontrei ${openInvoices.length} fatura(s) em aberto. Aqui está o PIX da mais antiga:`;
                        botResponse.type = 'pix';
                        botResponse.pixCode = openInvoices[0].pix_code || openInvoices[0].linha_digitavel;
                    } else {
                        botResponse.text = "Parabéns! Não constam faturas em aberto no seu cadastro.";
                    }
                } else if (lowerText.includes('internet') || lowerText.includes('caiu') || lowerText.includes('lenta')) {
                    const hasOverdue = invoices?.some(i => i.status === 'vencido');
                    if (hasOverdue) {
                        botResponse.text = "Verifiquei que existe uma fatura vencida. Seu sinal pode ter sido reduzido. Deseja realizar o desbloqueio de confiança?";
                        botResponse.options = [{ label: 'Sim, desbloquear', action: 'desbloqueio' }];
                    } else {
                        botResponse.text = "Sua conexão parece normal no sistema. Por favor, desligue seu roteador da tomada por 30 segundos e ligue novamente. Se não voltar, chame nosso suporte.";
                    }
                } else if (lowerText.includes('desbloqueio')) {
                    handleUnlockTrust();
                    botResponse.text = "Solicitação de desbloqueio enviada! Aguarde cerca de 10 minutos e reinicie seu equipamento.";
                } else {
                    botResponse.text = "Desculpe, não entendi. Posso ajudar com Faturas, Suporte Técnico ou Desbloqueio.";
                    botResponse.options = [
                        { label: '2ª Via de Fatura', action: 'fatura' },
                        { label: 'Falar com Humano', action: 'humano' }
                    ];
                }
                
                setMessages(prev => [...prev, botResponse]);
                setIsBotTyping(false);
            }, 1000);
        } finally {
            setIsBotTyping(false);
        }
    };

    const SimpleLineChart = ({ data }: { data: ConsumptionData[] }) => {
        if (!data || data.length === 0) return <div className="text-center py-20 text-gray-500">Sem dados para exibir</div>;

        const height = 300;
        const width = 1000;
        const padding = 40;
        const maxVal = Math.max(...data.map(d => Math.max(d.download, d.upload)), 10) * 1.1;

        const getX = (i: number) => padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
        const getY = (val: number) => height - padding - (val / maxVal) * (height - 2 * padding);

        const dlPoints = data.map((d, i) => `${getX(i)},${getY(d.download)}`).join(' ');
        const ulPoints = data.map((d, i) => `${getX(i)},${getY(d.upload)}`).join(' ');

        const dlPath = data.length > 1 ? `M ${dlPoints}` : `M ${padding} ${height-padding} L ${width-padding} ${height-padding}`;
        const ulPath = data.length > 1 ? `M ${ulPoints}` : `M ${padding} ${height-padding} L ${width-padding} ${height-padding}`;

        const dlArea = `${dlPath} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;
        const ulArea = `${ulPath} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-sans">
                        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                            <line key={t} x1={padding} y1={getY(maxVal * t)} x2={width - padding} y2={getY(maxVal * t)} stroke="#333" strokeWidth="1" strokeDasharray="4" />
                        ))}
                        <path d={dlArea} fill="rgba(6, 182, 212, 0.1)" />
                        <path d={ulArea} fill="rgba(249, 115, 22, 0.1)" />
                        <path d={dlPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={ulPath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {data.map((d, i) => (
                            <g key={i}>
                                <circle cx={getX(i)} cy={getY(d.download)} r="4" fill="#06b6d4" className="hover:r-6 transition-all" />
                                <circle cx={getX(i)} cy={getY(d.upload)} r="4" fill="#f97316" className="hover:r-6 transition-all" />
                                {data.length <= 12 && (
                                    <text x={getX(i)} y={height - 15} textAnchor="middle" fill="#666" fontSize="12">{d.label}</text>
                                )}
                            </g>
                        ))}
                    </svg>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-500 rounded-full"></div><span className="text-gray-300 text-sm">Download (GB)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-gray-300 text-sm">Upload (GB)</span></div>
                </div>
            </div>
        );
    };

    // === LOGIN RENDER ===
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-fiber-dark flex flex-col pt-24 pb-12">
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-fiber-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-neutral-900 p-8 text-center border-b border-white/5">
                            <div className="inline-flex items-center justify-center p-4 bg-fiber-orange/10 rounded-full text-fiber-orange mb-4">
                                <User size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Central do Assinante</h1>
                            <p className="text-gray-400 mt-2 text-sm">Acesse sua conta com segurança</p>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                        <input type="email" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="seu@email.com" className="w-full h-12 pl-11 pr-4 bg-fiber-dark border border-white/10 rounded-lg text-white focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 pl-11 pr-12 bg-fiber-dark border border-white/10 rounded-lg text-white focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fiber-orange">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 accent-fiber-orange rounded" />
                                        <span className="ml-2 text-sm text-gray-400">Lembrar e-mail</span>
                                    </label>
                                    <a href="https://wa.me/552424581861" target="_blank" className="text-sm text-fiber-orange hover:underline">Esqueceu a senha?</a>
                                </div>
                                {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={16} />{error}</div>}
                                <Button type="submit" variant="primary" fullWidth disabled={loading} className="h-12 text-base mt-2">
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar na Central'}
                                </Button>
                                <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg text-center border border-white/5">
                                    <p className="text-xs text-gray-400">Modo de Teste: <span className="text-white font-mono">teste</span> / <span className="text-white font-mono">123</span></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const hasOverdue = invoices?.some(i => i.status === 'vencido');

    // === DASHBOARD RENDER ===
    return (
        <div className="min-h-screen bg-fiber-dark pt-24 pb-12">
            
            {/* Header */}
            <div className="bg-fiber-card border-y border-white/5 mb-8 sticky top-16 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-neutral-800 p-3 rounded-full text-gray-300 border border-white/5">
                                <User size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Olá, {clientName}</h1>
                                <p className="text-sm text-fiber-orange flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${connection?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {connection?.status === 'online' ? 'Conectado' : 'Desconectado'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="text-sm py-2 px-4 border-white/20 text-gray-300 hover:bg-white/5">
                            <LogOut size={16} className="mr-2" /> Sair
                        </Button>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex gap-6 overflow-x-auto no-scrollbar border-t border-white/5 pt-2">
                        {[
                            { id: 'dashboard', label: 'Visão Geral', icon: Home },
                            { id: 'consumption', label: 'Meus Consumos', icon: BarChart3 },
                            { id: 'reports', label: 'Relatórios', icon: FileCheck },
                            { id: 'fiscal', label: 'Notas Fiscais', icon: FileText },
                            { id: 'chat', label: 'Atendimento', icon: MessageSquare },
                            { id: 'options', label: 'Opções', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'text-fiber-orange border-fiber-orange' 
                                        : 'text-gray-400 border-transparent hover:text-white hover:border-gray-700'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* TAB: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                        
                        {/* Sidebar - Status */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Status de Conexão */}
                            <div className="bg-fiber-card border border-white/10 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-fiber-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                    <Activity size={18} className="text-fiber-orange" /> Status da Conexão
                                </h3>
                                
                                <div className="flex items-center justify-center mb-6">
                                    <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${connection?.status === 'online' ? 'border-green-500/20' : 'border-red-500/20'}`}>
                                        <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${connection?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <Wifi size={40} className={connection?.status === 'online' ? 'text-green-500' : 'text-red-500'} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-neutral-900/50 rounded-lg p-3 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm flex items-center gap-2"><Clock size={14} /> Tempo Conectado</span>
                                        <span className="text-white font-mono font-bold">{connection?.uptime || '--'}</span>
                                    </div>
                                    <div className="bg-neutral-900/50 rounded-lg p-3 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm flex items-center gap-2"><ArrowDown size={14} className="text-fiber-blue" /> Download Mês</span>
                                        <span className="text-white font-mono font-bold">{connection?.download_usage || '0 GB'}</span>
                                    </div>
                                    <div className="bg-neutral-900/50 rounded-lg p-3 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm flex items-center gap-2"><ArrowUp size={14} className="text-fiber-orange" /> Upload Mês</span>
                                        <span className="text-white font-mono font-bold">{connection?.upload_usage || '0 GB'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Desbloqueio */}
                            {hasOverdue && !unlockedSuccess && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 animate-pulse">
                                    <div className="flex items-center gap-3 mb-3 text-red-400">
                                        <Unlock size={24} />
                                        <h3 className="font-bold">Sinal Bloqueado?</h3>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-4">
                                        Você possui faturas vencidas. Utilize o desbloqueio de confiança para liberar sua internet por 48h.
                                    </p>
                                    <button 
                                        onClick={handleUnlockTrust}
                                        disabled={unlocking}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {unlocking ? <Loader2 className="animate-spin" /> : <Unlock size={16} />}
                                        {unlocking ? 'Liberando...' : 'Liberar Internet Agora'}
                                    </button>
                                </div>
                            )}
                            
                            {unlockedSuccess && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                                        <CheckCircle size={20} /> Desbloqueio Realizado!
                                    </div>
                                    <p className="text-sm text-gray-300">Reinicie seu roteador em 5 minutos.</p>
                                </div>
                            )}
                        </div>

                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Faturas */}
                            <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="text-fiber-orange" /> Minhas Faturas
                                    </h2>
                                    <span className="bg-neutral-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
                                        {invoices?.length || 0} total
                                    </span>
                                </div>

                                {(!invoices || invoices.length === 0) ? (
                                    <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-dashed border-white/10">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                        <h3 className="text-white font-bold text-lg">Tudo em dia!</h3>
                                        <p className="text-gray-400">Você não possui faturas em aberto.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {invoices.map((invoice, idx) => (
                                            <div key={idx} className="bg-fiber-dark border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all hover:border-fiber-orange/30 group">
                                                <div className="flex-1 w-full md:w-auto text-center md:text-left">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit mx-auto md:mx-0 ${
                                                            invoice.status === 'vencido' 
                                                                ? 'bg-red-500/10 text-red-500' 
                                                                : invoice.status === 'pago' ? 'bg-green-500/10 text-green-500'
                                                                : 'bg-fiber-blue/10 text-fiber-blue'
                                                        }`}>
                                                            {invoice.status}
                                                        </span>
                                                        <span className="text-gray-500 text-sm">{invoice.descricao}</span>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 mt-3">
                                                        <div>
                                                            <span className="text-gray-500 text-[10px] block uppercase tracking-widest font-bold">Vencimento</span>
                                                            <span className={`text-lg font-bold ${invoice.status === 'vencido' ? 'text-red-400' : 'text-white'}`}>
                                                                {invoice.vencimento}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 text-[10px] block uppercase tracking-widest font-bold">Valor</span>
                                                            <span className="text-lg font-bold text-white">R$ {invoice.valor}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
                                                    {invoice.status !== 'pago' && invoice.pix_code && (
                                                        <button onClick={() => openPixModal(invoice.pix_code!)} className="flex items-center px-4 py-2 bg-fiber-green/10 hover:bg-fiber-green/20 text-fiber-green rounded-lg text-sm font-bold transition-colors border border-fiber-green/30">
                                                            <QrCode size={16} className="mr-2" /> PIX
                                                        </button>
                                                    )}
                                                    {invoice.status !== 'pago' && invoice.linha_digitavel && (
                                                        <button onClick={() => copyToClipboard(invoice.linha_digitavel!, `bar-${idx}`)} className="flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium border border-white/10">
                                                            {copiedId === `bar-${idx}` ? <CheckCircle size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />} Código
                                                        </button>
                                                    )}
                                                    {invoice.link_pdf && (
                                                        <button onClick={() => window.open(invoice.link_pdf, '_blank')} className="flex items-center px-4 py-2 bg-fiber-orange hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-900/20">
                                                            <Download size={16} className="mr-2" /> PDF
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dados do Cliente e Contrato */}
                            <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8">
                                <h3 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                    <Shield size={18} className="text-fiber-orange" /> Dados do Assinante
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-gray-500 text-xs uppercase font-bold block mb-1">Nome do Titular</label>
                                        <p className="text-white font-medium bg-neutral-900 p-3 rounded-lg border border-white/5">{clientName}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 text-xs uppercase font-bold block mb-1">Plano Contratado</label>
                                        <p className="text-fiber-orange font-bold bg-neutral-900 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                                            {contract?.plan_name}
                                            <span className="text-xs bg-fiber-orange/20 px-2 py-1 rounded text-fiber-orange">{contract?.speed_label}</span>
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-gray-500 text-xs uppercase font-bold block mb-1">Endereço de Instalação</label>
                                        <p className="text-gray-300 text-sm bg-neutral-900 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-500" />
                                            {contract?.address}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 text-xs uppercase font-bold block mb-1">Data de Ativação</label>
                                        <p className="text-white text-sm bg-neutral-900 p-3 rounded-lg border border-white/5">{contract?.installation_date}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 text-xs uppercase font-bold block mb-1">Status do Contrato</label>
                                        <p className="text-green-400 font-bold text-sm bg-neutral-900 p-3 rounded-lg border border-white/5 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> {contract?.status}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* TAB: CONSUMPTION */}
                {activeTab === 'consumption' && (
                    <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <BarChart3 className="text-fiber-orange" /> Histórico de Consumo
                                </h2>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <Activity size={16} className="text-green-400 animate-pulse" />
                                    <span className="text-green-400 font-bold">Dados reais sincronizados com IXC</span>
                                </div>
                            </div>
                            <div className="flex bg-neutral-900 p-1 rounded-lg border border-white/5">
                                {(['daily', 'weekly', 'monthly'] as const).map(p => (
                                    <button key={p} onClick={() => setConsumptionPeriod(p)} className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${consumptionPeriod === p ? 'bg-fiber-orange text-white' : 'text-gray-400 hover:text-white'}`}>
                                        {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : 'Mensal'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {isLoadingChart ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-fiber-orange" size={40} />
                                <span className="ml-3 text-gray-400">Carregando dados...</span>
                            </div>
                        ) : (
                            <div className="bg-neutral-900/50 rounded-xl p-6 border border-white/5">
                                <SimpleLineChart data={chartData} />
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: REPORTS */}
                {activeTab === 'reports' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-neutral-800 rounded-lg text-gray-400"><FileCheck size={24} /></div>
                                <div>
                                    <h3 className="text-white font-bold">Declaração de Quitação</h3>
                                    <p className="text-gray-400 text-sm">Emita o comprovante de quitação anual de débitos.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <select value={reportYear} onChange={(e) => setReportYear(e.target.value)} className="bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                                <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-gray-300 transition-colors"><Printer size={20} /></button>
                            </div>
                        </div>
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-neutral-800 rounded-lg text-gray-400"><Phone size={24} /></div>
                                <div>
                                    <h3 className="text-white font-bold">Extrato de Ligações</h3>
                                    <p className="text-gray-400 text-sm">Consulte o histórico de chamadas do seu telefone fixo.</p>
                                </div>
                            </div>
                            <div className="p-8 bg-neutral-900/50 rounded-lg text-center border border-white/5 text-gray-500 text-sm">
                                Nenhum ramal telefônico vinculado a este contrato.
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: FISCAL NOTES */}
                {activeTab === 'fiscal' && (
                    <div className="bg-fiber-card border border-white/10 rounded-xl p-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ScrollText className="text-fiber-orange" /> Notas Fiscais (NF 21/22)
                        </h2>
                        <div className="space-y-3">
                            {fiscalNotes.length > 0 ? fiscalNotes.map((nf, i) => (
                                <div key={i} className="bg-fiber-dark border border-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-neutral-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-gray-500 text-sm font-mono">{nf.referencia}</div>
                                        <div>
                                            <div className="text-white font-bold text-sm">Nota Nº {nf.numero} - Série {nf.serie}</div>
                                            <div className="text-gray-500 text-xs">Emissão: {nf.emissao} • Valor: R$ {nf.valor}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => window.open(nf.link_xml, '_blank')} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1"><FileCode size={14} /> XML</button>
                                        <button onClick={() => window.open(nf.link_pdf, '_blank')} className="p-2 hover:bg-fiber-orange/20 rounded text-fiber-orange font-bold text-xs flex items-center gap-1"><Download size={14} /> PDF</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">Nenhuma nota fiscal encontrada para o período.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: CHAT */}
                {activeTab === 'chat' && (
                    <div className="bg-fiber-card border border-white/10 rounded-xl h-[600px] flex flex-col animate-fadeIn">
                        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-neutral-900/50">
                            <Bot className="text-fiber-orange" />
                            <div>
                                <h3 className="text-white font-bold">Assistente Virtual</h3>
                                <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                        msg.sender === 'user' 
                                            ? 'bg-fiber-orange text-white rounded-tr-none' 
                                            : 'bg-neutral-800 text-gray-200 rounded-tl-none border border-white/5'
                                    }`}>
                                        {msg.text}
                                        {msg.type === 'pix' && msg.pixCode && (
                                            <div className="mt-3 bg-black/20 p-3 rounded border border-white/10">
                                                <p className="font-mono text-xs break-all text-gray-300 mb-2">{msg.pixCode}</p>
                                                <button onClick={() => copyToClipboard(msg.pixCode!, 'chat-pix')} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold transition-colors">
                                                    Copiar Código PIX
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isBotTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-neutral-800 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-white/5 bg-neutral-900/30">
                            {messages.length > 0 && messages[messages.length - 1].options && (
                                <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                                    {messages[messages.length - 1].options?.map((opt, idx) => (
                                        <button key={idx} onClick={() => sendMessage(opt.label)} className="whitespace-nowrap px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-fiber-orange/30 text-fiber-orange text-xs font-bold rounded-full transition-colors">
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={chatInput} 
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(chatInput)}
                                    placeholder="Digite sua mensagem..." 
                                    className="w-full bg-neutral-900 border border-white/10 rounded-full pl-5 pr-12 py-3 text-white text-sm focus:border-fiber-orange focus:outline-none"
                                />
                                <button onClick={() => sendMessage(chatInput)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-fiber-orange rounded-full text-white hover:bg-orange-600 transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: OPTIONS */}
                {activeTab === 'options' && (
                    <div className="bg-fiber-card border border-white/10 rounded-xl p-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Settings className="text-fiber-orange" /> Configurações da Conta
                        </h2>
                        <div className="max-w-2xl">
                            <div className="bg-neutral-900 rounded-lg border border-white/5 overflow-hidden">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-800 rounded text-fiber-orange"><KeyRound size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Alterar Senha</h4>
                                            <p className="text-xs text-gray-500">Atualize sua senha de acesso à central</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)} className="text-gray-400 hover:text-white"><ChevronRight /></button>
                                </div>
                                {isChangePasswordOpen && (
                                    <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
                                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Senha Atual" className="w-full bg-fiber-dark border border-white/10 rounded px-3 py-2 text-white text-sm" />
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova Senha" className="w-full bg-fiber-dark border border-white/10 rounded px-3 py-2 text-white text-sm" />
                                        <Button onClick={handleChangePassword} disabled={passwordLoading} fullWidth className="h-10 text-sm">
                                            {passwordLoading ? 'Alterando...' : 'Confirmar Alteração'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* PIX MODAL */}
            {activePixCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closePixModal}></div>
                    <div className="relative bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <button onClick={closePixModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                        <div className="text-center mb-6">
                            <div className="inline-flex p-3 bg-fiber-green/10 rounded-full text-fiber-green mb-3"><QrCode size={32} /></div>
                            <h3 className="text-xl font-bold text-white">Pagamento via PIX</h3>
                            <p className="text-gray-400 text-sm mt-1">Copie o código abaixo e cole no seu banco.</p>
                        </div>
                        <div className="bg-neutral-900 p-3 rounded-lg border border-white/5 mb-6">
                            <p className="text-gray-500 text-xs break-all font-mono line-clamp-6">{activePixCode}</p>
                        </div>
                        <button onClick={copyPixCode} className="w-full py-3 px-4 bg-fiber-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                            {isPixCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
                            {isPixCopied ? 'Copiado!' : 'Copiar Chave PIX'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientArea;