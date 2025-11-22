
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Shield, Eye, EyeOff, Mail, AlertTriangle, Wifi, Activity, 
  Router, Unlock, Clock, ChevronRight, MapPin, RefreshCw, BarChart3, Calendar, 
  Printer, Phone, FileCheck, ScrollText, FileCode, MessageSquare, Send, Bot, 
  MoreHorizontal 
} from 'lucide-react';
import Button from './Button';
import { Invoice } from '../types';

// Tipos extendidos para o Dashboard Completo
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
    download: number; // GB
    upload: number;   // GB
}

interface FiscalNote {
    id: number;
    numero: string;
    serie: string;
    emissao: string;
    referencia: string; // mm/aaaa
    valor: string;
    link_pdf?: string;
    link_xml?: string;
}

// Chat Types
interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    type?: 'text' | 'pix';
    options?: { label: string; action: string }[];
    pixCode?: string;
}

const ClientArea: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dashboard Data State
    const [clientName, setClientName] = useState('Cliente Fiber.Net');
    const [invoices, setInvoices] = useState<Invoice[] | null>(null);
    const [connection, setConnection] = useState<ConnectionData | null>(null);
    const [contract, setContract] = useState<ContractData | null>(null);
    const [protocols, setProtocols] = useState<Protocol[] | null>(null);
    const [fiscalNotes, setFiscalNotes] = useState<FiscalNote[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'consumption' | 'reports' | 'fiscal'>('dashboard');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activePixCode, setActivePixCode] = useState<string | null>(null);
    const [isPixCopied, setIsPixCopied] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [unlockedSuccess, setUnlockedSuccess] = useState(false);

    // Consumption State
    const [consumptionPeriod, setConsumptionPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [chartData, setChartData] = useState<ConsumptionData[]>([]);
    const [isLoadingChart, setIsLoadingChart] = useState(false);

    // Reports/Fiscal State
    const [reportYear, setReportYear] = useState('2025');

    // Chatbot State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Load saved Login on mount
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

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isBotTyping, isChatOpen]);

    // Init Chat when opened
    useEffect(() => {
        if (isChatOpen && messages.length === 0) {
            setIsBotTyping(true);
            setTimeout(() => {
                setMessages([
                    {
                        id: 1,
                        sender: 'bot',
                        text: `Olá, ${clientName.split(' ')[0]}! Sou o assistente virtual da Fiber.Net. Como posso te ajudar hoje?`,
                        options: [
                            { label: '2ª Via de Fatura', action: 'fatura' },
                            { label: 'Estou sem internet', action: 'suporte' },
                            { label: 'Desbloqueio de Confiança', action: 'desbloqueio' },
                            { label: 'Falar com Atendente', action: 'humano' }
                        ]
                    }
                ]);
                setIsBotTyping(false);
            }, 1000);
        }
    }, [isChatOpen]);

    // Atualiza o gráfico quando muda o período (apenas no modo demo por enquanto)
    useEffect(() => {
        if (isDemoMode) {
            setChartData(generateMockConsumption(consumptionPeriod));
        } else if (isAuthenticated && activeTab === 'consumption') {
            // Lógica para buscar consumo real (se disponível na API)
            // fetchRealConsumption(consumptionPeriod);
        }
    }, [consumptionPeriod, isDemoMode, isAuthenticated, activeTab]);

    // --- DADOS MOCKADOS (Simulação Completa de ISP) ---
    const loadDemoData = () => {
        setIsAuthenticated(true);
        setIsDemoMode(true);
        setClientName('João da Silva');

        // 1. Faturas
        setInvoices([
            {
                id: 101,
                vencimento: '10/12/2025',
                valor: '99,90',
                status: 'aberto',
                descricao: 'Mensalidade Fibra 500MB',
                linha_digitavel: '34191.79001 01043.510047 91020.150008 5 84600000026000',
                pix_code: '00020126360014BR.GOV.BCB.PIX0114+552499999999520400005303986540599.905802BR5925FIBER NET TELECOM6009RIO DAS FLORES62070503***6304ABCD'
            },
            {
                id: 102,
                vencimento: '10/11/2025',
                valor: '99,90',
                status: 'vencido',
                descricao: 'Mensalidade Fibra 500MB',
                linha_digitavel: '34191.79001 01043.510047 91020.150008 5 84600000026000'
            },
            {
                id: 103,
                vencimento: '10/10/2025',
                valor: '99,90',
                status: 'pago',
                descricao: 'Mensalidade Fibra 500MB'
            }
        ]);

        // 2. Dados de Conexão
        setConnection({
            status: 'online',
            ip: '177.45.12.104',
            uptime: '14 dias, 3 horas',
            download_usage: '450 GB',
            upload_usage: '120 GB',
            mac: 'A1:B2:C3:D4:E5:F6',
            last_auth: '22/10/2025 08:30'
        });

        // 3. Contrato
        setContract({
            id: 5502,
            plan_name: 'FIBER MAX 500 MEGA',
            speed_label: '500 Mbps',
            address: 'Rua das Flores, 123, Centro - Rio das Flores/RJ',
            installation_date: '15/01/2023',
            status: 'Ativo'
        });

        // 4. Protocolos
        setProtocols([
            { id: '2025102201', type: 'Financeiro', subject: 'Solicitação de 2ª via', date: '22/10/2025', status: 'Fechado' },
            { id: '2025091503', type: 'Suporte', subject: 'Lentidão momentânea', date: '15/09/2025', status: 'Fechado' }
        ]);

        // 5. Consumo Inicial (Diário)
        setChartData(generateMockConsumption('daily'));

        // 6. Notas Fiscais
        setFiscalNotes([
            { id: 501, numero: '000152', serie: '1', emissao: '10/10/2025', referencia: 'Outubro/2025', valor: '99,90', link_pdf: '#', link_xml: '#' },
            { id: 500, numero: '000148', serie: '1', emissao: '10/09/2025', referencia: 'Setembro/2025', valor: '99,90', link_pdf: '#', link_xml: '#' },
            { id: 499, numero: '000135', serie: '1', emissao: '10/08/2025', referencia: 'Agosto/2025', valor: '99,90', link_pdf: '#', link_xml: '#' },
        ]);
    };

    const generateMockConsumption = (period: 'daily' | 'weekly' | 'monthly'): ConsumptionData[] => {
        const data: ConsumptionData[] = [];
        const now = new Date();
        
        if (period === 'daily') {
            // Últimos 30 dias
            for (let i = 30; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                data.push({
                    label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    download: Math.floor(Math.random() * 40) + 5,
                    upload: Math.floor(Math.random() * 10) + 1
                });
            }
        } else if (period === 'weekly') {
            // Últimos 7 dias (mais detalhado)
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                data.push({
                    label: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
                    download: Math.floor(Math.random() * 60) + 20,
                    upload: Math.floor(Math.random() * 20) + 5
                });
            }
        } else {
            // Últimos 12 meses
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(now.getMonth() - i);
                data.push({
                    label: d.toLocaleDateString('pt-BR', { month: 'short' }),
                    download: Math.floor(Math.random() * 800) + 200,
                    upload: Math.floor(Math.random() * 200) + 50
                });
            }
        }
        return data;
    };

    const fetchDashboardData = async (token: string) => {
        setLoading(true);
        try {
            const response = await fetch('https://api.centralfiber.online/api/v1/dashboard/dados', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                handleLogout(false);
                throw new Error('Sessão expirada.');
            }

            const data = await response.json();
            
            setClientName(data.cliente?.nome?.split(' ')[0] || 'Cliente');
            setInvoices(data.faturas || []);
            setConnection(data.conexao || null);
            setContract(data.contrato || null);
            setProtocols(data.protocolos || []);
            // Notas Fiscais viriam da API aqui também
            setFiscalNotes(data.notas_fiscais || []); 

            setIsAuthenticated(true);
            setError(null);

        } catch (err: any) {
            console.error('Fetch Error:', err);
            if (token === 'demo-token') {
                loadDemoData();
            } else {
                handleLogout(false);
                setError('Falha ao carregar dados. Faça login novamente.');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!login || !password) { setError('Preencha o e-mail e a senha.'); return; }
        
        setLoading(true);
        setError(null);

        // DEV MODE Mock (Prioridade para teste explícito)
        if (login === 'teste' && password === '123') {
            setTimeout(() => {
                localStorage.setItem('fiber_auth_token', 'demo-token');
                if (rememberMe) localStorage.setItem('fiber_client_login', login);
                else localStorage.removeItem('fiber_client_login');
                loadDemoData();
                setLoading(false);
            }, 1000);
            return;
        }

        // Timeout Controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            // Limpeza do login
            const cleanLogin = login.includes('@') ? login.trim() : login.replace(/\D/g, '');

            // Envia login e senha para o endpoint de autenticação
            const response = await fetch('https://api.centralfiber.online/api/v1/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    login: cleanLogin, 
                    senha: password 
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data?.message || `Erro do servidor: ${response.status}`);
            }
            
            if (data && data.token) {
                localStorage.setItem('fiber_auth_token', data.token);
                
                if (rememberMe) {
                    localStorage.setItem('fiber_client_login', login);
                } else {
                    localStorage.removeItem('fiber_client_login');
                }
                
                await fetchDashboardData(data.token); 
                setLoading(false); // Ensure loading stops on success
            } else {
                 throw new Error('Erro no servidor: Token não recebido.');
            }
        } catch (err: any) {
            console.error('Login Failed:', err);
            
            // --- FALLBACK AUTOMÁTICO ---
            // Se o servidor estiver fora (Failed to fetch), ativa o modo Demo para que o usuário possa ver a UI.
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                setError('Servidor indisponível. Entrando em Modo Demonstração...');
                
                setTimeout(() => {
                    localStorage.setItem('fiber_auth_token', 'demo-token');
                    if (rememberMe) localStorage.setItem('fiber_client_login', login);
                    loadDemoData();
                    setError(null);
                    setLoading(false);
                }, 1500);
                return; // Retorna para não executar o setLoading(false) abaixo imediatamente
            }

            let errorMessage = err.message || 'Falha desconhecida.';
            if (err.name === 'AbortError') {
                errorMessage = 'O servidor demorou muito para responder. Tente novamente.';
            }
            
            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleLogout = (clearLogin = true) => {
        setIsAuthenticated(false);
        setInvoices(null);
        setConnection(null);
        setContract(null);
        setProtocols(null);
        setFiscalNotes([]);
        setClientName('');
        setError(null);
        setPassword('');
        setIsDemoMode(false);
        setUnlockedSuccess(false);
        setIsChatOpen(false);
        localStorage.removeItem('fiber_auth_token');
        if (!rememberMe || clearLogin) {
            setLogin('');
            localStorage.removeItem('fiber_client_login');
        }
    };

    const handleUnlockTrust = () => {
        setUnlocking(true);
        setTimeout(() => {
            setUnlocking(false);
            setUnlockedSuccess(true);
        }, 2000);
    };

    // CHATBOT LOGIC
    const handleChatOption = (action: string, label: string) => {
        // Add user message
        setMessages(prev => [...prev, { id: Date.now(), text: label, sender: 'user' }]);
        setIsBotTyping(true);

        setTimeout(() => {
            let botResponse: ChatMessage = { id: Date.now() + 1, text: '', sender: 'bot' };

            switch(action) {
                case 'fatura':
                    const openInvoices = invoices?.filter(i => i.status !== 'pago') || [];
                    if (openInvoices.length > 0) {
                        const inv = openInvoices[0];
                        botResponse.text = `Encontrei uma fatura com vencimento em ${inv.vencimento} no valor de R$ ${inv.valor}.`;
                        if (inv.pix_code) {
                            botResponse.type = 'pix';
                            botResponse.pixCode = inv.pix_code;
                        } else if (inv.linha_digitavel) {
                            botResponse.text += "\nCódigo de barras: " + inv.linha_digitavel;
                        }
                        botResponse.options = [{ label: 'Voltar ao menu', action: 'menu' }];
                    } else {
                        botResponse.text = "Parabéns! Não encontrei nenhuma fatura em aberto no seu cadastro. Você está em dia com a Fiber.Net!";
                        botResponse.options = [{ label: 'Voltar ao menu', action: 'menu' }];
                    }
                    break;

                case 'suporte':
                    if (connection?.status === 'offline') {
                        botResponse.text = "Identifiquei que seu equipamento consta como OFFLINE. Por favor, verifique se ele está ligado na tomada e se os cabos estão conectados. Já tentou reiniciar?";
                        botResponse.options = [
                            { label: 'Sim, já reiniciei', action: 'reiniciei' },
                            { label: 'Vou tentar agora', action: 'menu' }
                        ];
                    } else {
                        botResponse.text = "Seu equipamento consta como ONLINE e com sinal estável. Se está com lentidão, pode ser interferência no Wi-Fi. Deseja falar com um atendente?";
                        botResponse.options = [
                            { label: 'Falar com Atendente', action: 'humano' },
                            { label: 'Voltar ao menu', action: 'menu' }
                        ];
                    }
                    break;

                case 'reiniciei':
                    // Check for overdue invoices logic for unlocking
                    const hasOverdue = invoices?.some(i => i.status === 'vencido');
                    if (hasOverdue && !unlockedSuccess) {
                        botResponse.text = "Entendi. Verifiquei que existe uma fatura vencida que pode ter causado o bloqueio automático. Você pode liberar o sinal por 48h agora mesmo.";
                        botResponse.options = [
                            { label: 'Liberar Internet (48h)', action: 'do_unlock' },
                            { label: 'Não, obrigado', action: 'menu' }
                        ];
                    } else {
                        botResponse.text = "Como o problema persiste, vou te encaminhar para nosso suporte técnico especializado no WhatsApp.";
                        botResponse.options = [{ label: 'Ir para WhatsApp', action: 'humano' }];
                    }
                    break;

                case 'desbloqueio':
                case 'do_unlock':
                    if (unlockedSuccess) {
                        botResponse.text = "Seu desbloqueio de confiança já foi utilizado recentemente e está ativo!";
                    } else {
                        handleUnlockTrust(); // Trigger dashboard action
                        botResponse.text = "Pronto! Realizei o desbloqueio de confiança. Seu sinal deve voltar em até 5 minutos. Lembre-se de regularizar a fatura em até 48 horas.";
                    }
                    botResponse.options = [{ label: 'Obrigado', action: 'menu' }];
                    break;

                case 'humano':
                    botResponse.text = "Para atendimento humano, por favor, clique no botão abaixo para abrir o WhatsApp da nossa equipe.";
                    window.open('https://wa.me/552424581861', '_blank');
                    botResponse.options = [{ label: 'Voltar ao menu', action: 'menu' }];
                    break;

                case 'menu':
                default:
                    botResponse.text = "Posso ajudar com algo mais?";
                    botResponse.options = [
                        { label: '2ª Via de Fatura', action: 'fatura' },
                        { label: 'Estou sem internet', action: 'suporte' },
                        { label: 'Desbloqueio de Confiança', action: 'desbloqueio' },
                        { label: 'Falar com Atendente', action: 'humano' }
                    ];
                    break;
            }

            setMessages(prev => [...prev, botResponse]);
            setIsBotTyping(false);
        }, 1000);
    };

    const copyToClipboard = (text: string, id: string) => {
        try { navigator.clipboard.writeText(text); } 
        catch (e) { /* Fallback logic */ }
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 3000);
    };
    const openPixModal = (code: string) => { setActivePixCode(code); setIsPixCopied(false); };
    const closePixModal = () => { setActivePixCode(null); setIsPixCopied(false); };
    const copyPixCode = () => { if (activePixCode) { copyToClipboard(activePixCode, 'pix-modal'); setIsPixCopied(true); } };

    // --- CHART COMPONENT (SVG Native) ---
    const SimpleLineChart = ({ data }: { data: ConsumptionData[] }) => {
        if (!data || data.length === 0) return null;
        
        const height = 300;
        const width = 1000;
        const padding = 40;
        
        // Encontrar valor máximo para escala
        const maxVal = Math.max(...data.map(d => Math.max(d.download, d.upload))) * 1.1;
        
        // Helpers para coordenadas
        const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
        const getY = (val: number) => height - padding - (val / maxVal) * (height - 2 * padding);
        
        // Construir paths (linhas)
        const dlPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.download)}`).join(' ');
        const ulPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.upload)}`).join(' ');
        
        // Construir áreas (para preenchimento gradiente)
        const dlArea = `${dlPath} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;
        const ulArea = `${ulPath} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] relative">
                     <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-xl">
                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                            <line 
                                key={tick} 
                                x1={padding} 
                                y1={getY(maxVal * tick)} 
                                x2={width - padding} 
                                y2={getY(maxVal * tick)} 
                                stroke="#ffffff20" 
                                strokeDasharray="4" 
                            />
                        ))}
                        
                        {/* Areas */}
                        <path d={dlArea} fill="rgba(6, 182, 212, 0.15)" />
                        <path d={ulArea} fill="rgba(249, 115, 22, 0.15)" />

                        {/* Lines */}
                        <path d={dlPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={ulPath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Points */}
                        {data.map((d, i) => (
                            <g key={i}>
                                <circle cx={getX(i)} cy={getY(d.download)} r="4" fill="#06b6d4" className="hover:r-6 transition-all" />
                                <circle cx={getX(i)} cy={getY(d.upload)} r="4" fill="#f97316" className="hover:r-6 transition-all" />
                                
                                {/* X Axis Labels (Mostrar menos se tiver muitos dados) */}
                                {(data.length < 15 || i % 3 === 0) && (
                                    <text x={getX(i)} y={height - 10} textAnchor="middle" fill="#9ca3af" fontSize="12">{d.label}</text>
                                )}
                            </g>
                        ))}

                         {/* Y Axis Labels */}
                         {[0, 0.5, 1].map(tick => (
                            <text key={tick} x={padding - 10} y={getY(maxVal * tick) + 4} textAnchor="end" fill="#9ca3af" fontSize="12">
                                {Math.round(maxVal * tick)}GB
                            </text>
                        ))}
                     </svg>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                        <span className="text-gray-300 text-sm">Download</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-fiber-orange rounded-full"></div>
                        <span className="text-gray-300 text-sm">Upload</span>
                    </div>
                </div>
            </div>
        );
    };


    // --- LOGIN SCREEN ---
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
                            <p className="text-gray-400 mt-2 text-sm">Acesse faturas, consumo e desbloqueio.</p>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">E-mail</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Mail size={20} /></div>
                                        <input type="email" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Digite seu e-mail cadastrado" className="w-full h-12 pl-11 pr-4 bg-fiber-dark border border-white/10 rounded-lg text-white focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Lock size={20} /></div>
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha da Central" className="w-full h-12 pl-11 pr-12 bg-fiber-dark border border-white/10 rounded-lg text-white focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-gray-500 hover:text-fiber-orange"><Eye size={20} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 accent-fiber-orange rounded bg-neutral-800" />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Lembrar e-mail</label>
                                    </div>
                                    <a href="https://wa.me/552424581861" target="_blank" className="text-sm text-fiber-orange hover:underline">Esqueceu a senha?</a>
                                </div>
                                {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={16} />{error}</div>}
                                <Button type="submit" variant="primary" fullWidth disabled={loading} className="h-12 text-base mt-2">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar'}</Button>
                                <div className="mt-2 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded text-center"><p className="text-[10px] text-yellow-600 font-bold">MOCK DEV</p><p className="text-xs text-gray-400">Login: teste | Senha: 123</p></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const hasOverdue = invoices?.some(i => i.status === 'vencido');

    return (
        <div className="min-h-screen bg-fiber-dark pt-24 pb-12">
            
            {/* Header & Tabs */}
            <div className="bg-fiber-card border-y border-white/5 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-neutral-800 p-3 rounded-full text-gray-300"><User size={24} /></div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Olá, {clientName}</h1>
                                <p className="text-sm text-gray-400">{contract?.plan_name || 'Plano Fibra'}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => handleLogout(true)} className="text-sm py-2 px-4"><LogOut size={16} className="mr-2" /> Sair</Button>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex space-x-6 border-b border-white/10 overflow-x-auto scrollbar-hide">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`pb-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'text-fiber-orange border-fiber-orange' : 'text-gray-400 border-transparent hover:text-white'}`}
                        >
                            Visão Geral
                        </button>
                        <button 
                            onClick={() => setActiveTab('consumption')}
                            className={`pb-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'consumption' ? 'text-fiber-orange border-fiber-orange' : 'text-gray-400 border-transparent hover:text-white'}`}
                        >
                            Meus Consumos
                        </button>
                        <button 
                            onClick={() => setActiveTab('reports')}
                            className={`pb-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'reports' ? 'text-fiber-orange border-fiber-orange' : 'text-gray-400 border-transparent hover:text-white'}`}
                        >
                            Relatórios
                        </button>
                        <button 
                            onClick={() => setActiveTab('fiscal')}
                            className={`pb-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'fiscal' ? 'text-fiber-orange border-fiber-orange' : 'text-gray-400 border-transparent hover:text-white'}`}
                        >
                            Notas Fiscais
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Alerts */}
                {isDemoMode && (
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="text-yellow-500" size={20} />
                        <span className="text-yellow-500 text-sm font-bold">Ambiente de Demonstração (Dados Fictícios)</span>
                    </div>
                )}

                {/* VIEW: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="animate-fadeIn">
                        {/* Desbloqueio de Confiança */}
                        {hasOverdue && !unlockedSuccess && (
                            <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/20 rounded-full text-red-500"><Unlock size={24} /></div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Sinal Bloqueado?</h3>
                                        <p className="text-red-400 text-sm">Você possui faturas pendentes. Utilize o desbloqueio de confiança para liberar seu sinal por 48h.</p>
                                    </div>
                                </div>
                                <Button onClick={handleUnlockTrust} disabled={unlocking} className="bg-red-600 hover:bg-red-700 text-white min-w-[200px]">
                                    {unlocking ? <Loader2 className="animate-spin" /> : 'Liberar Internet Agora'}
                                </Button>
                            </div>
                        )}

                        {unlockedSuccess && (
                            <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
                                <CheckCircle className="text-green-500" size={24} />
                                <div>
                                    <h4 className="text-white font-bold">Internet Liberada com Sucesso!</h4>
                                    <p className="text-green-400 text-sm">Seu sinal ficará ativo por 48 horas. Regularize sua fatura para evitar novo bloqueio.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Connection & Contract */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-fiber-card border border-white/10 rounded-xl p-6 relative overflow-hidden">
                                    {connection?.status === 'online' ? (
                                        <div className="absolute top-0 right-0 p-4"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div></div>
                                    ) : (
                                        <div className="absolute top-0 right-0 p-4"><div className="w-3 h-3 bg-red-500 rounded-full"></div></div>
                                    )}
                                    
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-fiber-orange" /> Status da Conexão</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg border border-white/5">
                                            <span className="text-gray-400 text-sm">Status</span>
                                            <span className={`font-bold ${connection?.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>{connection?.status === 'online' ? 'CONECTADO' : 'DESCONECTADO'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg border border-white/5">
                                            <span className="text-gray-400 text-sm">Uptime</span>
                                            <span className="text-white font-mono text-sm">{connection?.uptime || '-'}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-neutral-900 rounded border border-white/5 text-center">
                                                <p className="text-[10px] text-gray-500 uppercase">Download (Mês)</p>
                                                <p className="text-fiber-blue font-bold text-lg">{connection?.download_usage || '0 GB'}</p>
                                            </div>
                                            <div className="p-2 bg-neutral-900 rounded border border-white/5 text-center">
                                                <p className="text-[10px] text-gray-500 uppercase">Upload (Mês)</p>
                                                <p className="text-fiber-orange font-bold text-lg">{connection?.upload_usage || '0 GB'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-fiber-card border border-white/10 rounded-xl p-6">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-fiber-orange" /> Meu Contrato</h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase">Plano Contratado</p>
                                            <p className="text-white font-bold text-lg">{contract?.plan_name}</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="text-fiber-orange mt-0.5 flex-shrink-0" />
                                            <p className="text-gray-300 text-xs">{contract?.address}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                                            <span className="text-gray-500 text-xs">Contrato #{contract?.id}</span>
                                            <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">ATIVO</span>
                                        </div>
                                        <button className="w-full mt-2 py-2 text-fiber-orange text-xs font-bold hover:underline flex items-center justify-center">
                                            <Download size={14} className="mr-1" /> Baixar Contrato PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content: Invoices & Protocols */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-fiber-orange" /> Minhas Faturas</h2>
                                        <span className="bg-neutral-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">{invoices?.filter(i => i.status !== 'pago').length || 0} pendentes</span>
                                    </div>

                                    {!invoices?.length ? (
                                        <div className="text-center py-12"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" /><h3 className="text-white">Tudo em dia!</h3></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {invoices.map((invoice, idx) => (
                                                <div key={idx} className="bg-fiber-dark border border-white/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                                    <div className="flex-1 w-full">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                invoice.status === 'vencido' ? 'bg-red-500/10 text-red-500' : 
                                                                invoice.status === 'pago' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                                            }`}>{invoice.status}</span>
                                                            <span className="text-gray-500 text-xs">{invoice.descricao}</span>
                                                        </div>
                                                        <div className="flex justify-between md:justify-start md:gap-8">
                                                            <div><p className="text-[10px] text-gray-500 uppercase">Vencimento</p><p className="text-white font-bold">{invoice.vencimento}</p></div>
                                                            <div><p className="text-[10px] text-gray-500 uppercase">Valor</p><p className="text-white font-bold">R$ {invoice.valor}</p></div>
                                                        </div>
                                                    </div>
                                                    
                                                    {invoice.status !== 'pago' && (
                                                        <div className="flex gap-2 w-full md:w-auto justify-end">
                                                            {invoice.pix_code && <button onClick={() => openPixModal(invoice.pix_code!)} className="p-2 bg-fiber-green/10 text-fiber-green rounded border border-fiber-green/20 hover:bg-fiber-green/20" title="PIX"><QrCode size={18} /></button>}
                                                            {invoice.linha_digitavel && <button onClick={() => copyToClipboard(invoice.linha_digitavel!, `bar-${idx}`)} className="p-2 bg-neutral-800 text-white rounded border border-white/10 hover:bg-neutral-700" title="Copiar Código"><Copy size={18} /></button>}
                                                            {invoice.link_pdf && <button onClick={() => window.open(invoice.link_pdf, '_blank')} className="p-2 bg-fiber-orange text-white rounded hover:bg-orange-600" title="PDF"><Download size={18} /></button>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-fiber-card border border-white/10 rounded-xl p-6">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Clock size={18} className="text-fiber-orange" /> Histórico de Atendimento</h3>
                                    <div className="space-y-3">
                                        {protocols?.length ? protocols.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded border border-white/5 hover:border-white/10 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white text-sm font-medium">{p.subject}</span>
                                                        <span className="text-[10px] bg-neutral-800 text-gray-400 px-1.5 rounded border border-white/5">{p.type}</span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-0.5">Protocolo: {p.id} • {p.date}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${p.status === 'Fechado' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{p.status}</span>
                                                    <ChevronRight size={14} className="text-gray-600" />
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 text-sm py-4">Nenhum protocolo recente.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: CONSUMPTION CHARTS */}
                {activeTab === 'consumption' && (
                    <div className="animate-fadeIn">
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <BarChart3 className="text-fiber-orange" /> Histórico de Consumo
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Acompanhe o tráfego de Download e Upload da sua conexão
                                    </p>
                                </div>

                                {/* Period Filters */}
                                <div className="flex bg-neutral-900 p-1 rounded-lg border border-white/5">
                                    <button 
                                        onClick={() => setConsumptionPeriod('daily')}
                                        className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${consumptionPeriod === 'daily' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Diário
                                    </button>
                                    <button 
                                        onClick={() => setConsumptionPeriod('weekly')}
                                        className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${consumptionPeriod === 'weekly' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Semanal
                                    </button>
                                    <button 
                                        onClick={() => setConsumptionPeriod('monthly')}
                                        className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${consumptionPeriod === 'monthly' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Mensal
                                    </button>
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                                    <Calendar size={14} />
                                    <span>
                                        {consumptionPeriod === 'daily' && 'Últimos 30 dias'}
                                        {consumptionPeriod === 'weekly' && 'Últimos 7 dias'}
                                        {consumptionPeriod === 'monthly' && 'Últimos 12 meses'}
                                    </span>
                                </div>
                                
                                <SimpleLineChart data={chartData} />
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: REPORTS */}
                {activeTab === 'reports' && (
                    <div className="animate-fadeIn space-y-6">
                        {/* Card 1: Quitação de Débitos */}
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-gray-400 border border-white/5">
                                    <FileCheck size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Relatórios</span>
                                    <h3 className="text-xl font-bold text-white mt-1">Quitação de Débitos</h3>
                                    <div className="mt-3">
                                        <select 
                                            value={reportYear}
                                            onChange={(e) => setReportYear(e.target.value)}
                                            className="bg-neutral-900 text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange"
                                        >
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button className="p-3 rounded-lg bg-neutral-800 hover:bg-fiber-orange hover:text-white text-gray-400 transition-colors border border-white/5" title="Imprimir Relatório">
                                <Printer size={24} />
                            </button>
                        </div>

                        {/* Card 2: Extrato de Ligações */}
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-gray-400 border border-white/5">
                                    <Phone size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Relatórios</span>
                                    <h3 className="text-xl font-bold text-white mt-1">Extrato de Ligações</h3>
                                    <div className="mt-3">
                                        <select 
                                            className="bg-neutral-900 text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange w-full md:w-auto"
                                        >
                                            <option>Extrato de Ligações Tarifadas</option>
                                            <option>Extrato Detalhado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Empty State Footer */}
                        <div className="py-8 text-center border-t border-white/5 mt-8">
                            <p className="text-gray-500 text-sm">Nenhum ramal encontrado!</p>
                        </div>
                    </div>
                )}

                {/* VIEW: FISCAL (Notas Fiscais) */}
                {activeTab === 'fiscal' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ScrollText className="text-fiber-orange" /> Notas Fiscais
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Documentos fiscais (NF-21/22 e NFSe) dos pagamentos realizados.
                                    </p>
                                </div>
                                <div>
                                    <select 
                                        value={reportYear}
                                        onChange={(e) => setReportYear(e.target.value)}
                                        className="bg-neutral-900 text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange"
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                    </select>
                                </div>
                            </div>

                            {fiscalNotes.length === 0 ? (
                                <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-dashed border-white/10">
                                    <ScrollText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <h3 className="text-white font-bold text-lg">Nenhuma Nota Fiscal</h3>
                                    <p className="text-gray-400">Não há documentos fiscais disponíveis para o ano selecionado.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {fiscalNotes.map((note) => (
                                        <div key={note.id} className="bg-fiber-dark border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-fiber-orange/30 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">NF 21/22</span>
                                                    <span className="text-gray-400 text-xs font-bold">Nota Nº {note.numero} - Série {note.serie}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase">Referência</span>
                                                        <p className="text-white font-bold">{note.referencia}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase">Emissão</span>
                                                        <p className="text-gray-300 font-mono text-sm">{note.emissao}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase">Valor</span>
                                                        <p className="text-white font-bold">R$ {note.valor}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button 
                                                    onClick={() => window.open(note.link_xml || '#', '_blank')}
                                                    className="flex-1 md:flex-none py-2 px-4 bg-neutral-800 text-gray-300 hover:text-white rounded-lg text-sm font-bold border border-white/10 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FileCode size={16} /> XML
                                                </button>
                                                <button 
                                                    onClick={() => window.open(note.link_pdf || '#', '_blank')}
                                                    className="flex-1 md:flex-none py-2 px-4 bg-fiber-orange text-white hover:bg-orange-600 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                                                >
                                                    <FileText size={16} /> PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* CHATBOT FLOATING BUTTON */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-24 right-6 z-50 bg-fiber-orange text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                aria-label="Abrir Assistente Virtual"
            >
                {isChatOpen ? <X size={28} /> : <Bot size={28} />}
            </button>

            {/* CHATBOT WINDOW */}
            {isChatOpen && (
                <div className="fixed bottom-40 right-6 z-50 w-80 sm:w-96 h-[500px] bg-fiber-card border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-float overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-neutral-900 p-4 border-b border-white/5 flex items-center gap-3">
                        <div className="bg-fiber-orange/10 p-2 rounded-full text-fiber-orange">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Assistente Virtual Fiber.Net</h3>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-gray-400">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50 scrollbar-thin scrollbar-thumb-neutral-700">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-fiber-orange text-white rounded-tr-none' 
                                        : 'bg-neutral-800 text-gray-200 rounded-tl-none border border-white/5'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    
                                    {/* Render Pix Code Special Block */}
                                    {msg.type === 'pix' && msg.pixCode && (
                                        <div className="mt-2 bg-white p-2 rounded-lg">
                                            <p className="text-neutral-900 text-xs font-mono break-all mb-2 select-all">{msg.pixCode}</p>
                                            <button 
                                                onClick={() => { copyToClipboard(msg.pixCode!, `chat-pix-${msg.id}`); }}
                                                className="w-full py-1.5 bg-neutral-900 text-white text-xs font-bold rounded flex items-center justify-center gap-1 hover:bg-neutral-700"
                                            >
                                                {copiedId === `chat-pix-${msg.id}` ? <CheckCircle size={12} /> : <Copy size={12} />}
                                                {copiedId === `chat-pix-${msg.id}` ? 'Copiado!' : 'Copiar PIX'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Render Options */}
                                    {msg.options && (
                                        <div className="mt-3 space-y-2">
                                            {msg.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleChatOption(opt.action, opt.label)}
                                                    className="w-full text-left px-3 py-2 bg-neutral-900 hover:bg-neutral-700 text-fiber-orange text-xs font-bold rounded border border-white/5 transition-colors"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isBotTyping && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-800 rounded-2xl rounded-tl-none p-3 border border-white/5">
                                    <MoreHorizontal size={20} className="text-gray-500 animate-pulse" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Footer (Input Placeholder - Disabled for Bot Flow) */}
                    <div className="p-3 bg-neutral-900 border-t border-white/5">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Selecione uma opção acima..." 
                                disabled
                                className="w-full bg-neutral-800 border border-white/10 rounded-full py-2 px-4 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                            />
                            <button disabled className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PIX Modal */}
            {activePixCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closePixModal}></div>
                    <div className="relative bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <button onClick={closePixModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                        <div className="text-center mb-4"><QrCode size={40} className="text-fiber-green mx-auto mb-2" /><h3 className="text-xl font-bold text-white">Pagamento via PIX</h3></div>
                        <div className="bg-neutral-900 p-3 rounded border border-white/5 mb-4"><p className="text-gray-500 text-xs break-all font-mono line-clamp-6">{activePixCode}</p></div>
                        <button onClick={copyPixCode} className="w-full py-3 bg-fiber-green text-white font-bold rounded hover:bg-green-600 flex justify-center items-center gap-2">{isPixCopied ? <CheckCircle size={18} /> : <Copy size={18} />} {isPixCopied ? 'Copiado!' : 'Copiar Código'}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientArea;
