import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Wifi, Activity, 
  Clock, Settings, Eye, EyeOff, Mail, ArrowUp, ArrowDown, LayoutDashboard, Ban,
  FileSignature, BarChart3, ScrollText, Zap, Power, Server, Link2, ThumbsUp, Printer, Trash2, ArrowLeft, MessageCircle, Globe,
  MapPin, Router, Bot, Send, Search, ChevronDown, HelpCircle, AlertTriangle
} from 'lucide-react';
import Button from './Button';
import { DashboardResponse, Consumo, Fatura, ChatMessage, HistoryData } from '../src/types/api';
import { apiService } from '../src/services/apiService';
import { CONTACT_INFO } from '../constants';
import AIInsights from '../src/components/AIInsights';
import { GoogleGenAI } from "@google/genai";

// MUDANÇA DE CHAVE PARA FORÇAR LIMPEZA DE CACHE
const DASH_CACHE_KEY = 'fiber_dashboard_cache_v31_env_fix';

const CHAT_SUGGESTIONS = [
    { label: "Minha fatura vence quando?", icon: FileText },
    { label: "O WhatsApp caiu?", icon: Globe },
    { label: "Instagram com problemas?", icon: Activity },
    { label: "Minha conexão está lenta", icon: Wifi },
    { label: "Quero a 2ª via do boleto", icon: QrCode },
];

// === HELPERS ===
const formatBytes = (bytes: number | string | undefined, decimals = 2) => {
    const val = Number(bytes);
    if (isNaN(val) || val === 0) return '0 GB';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = parseInt(Math.floor(Math.log(val) / Math.log(1024)).toString());
    return Math.round(val / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const bytesToGB = (bytes: number) => {
    return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
};

// === SUB-COMPONENT: CONSUMPTION CHART ===
const ConsumptionChart: React.FC<{ history?: HistoryData }> = ({ history }) => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [activePoint, setActivePoint] = useState<{ label: string, download: number, upload: number } | null>(null);

    const rawData = history?.[period] || [];
    
    const data = rawData.map(item => ({
        label: period === 'daily' ? (item.data || '') : period === 'weekly' ? (item.semana || '') : (item.mes_ano || ''),
        download: bytesToGB(item.download_bytes),
        upload: bytesToGB(item.upload_bytes)
    })).reverse(); 

    if(!history || data.length === 0){
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 bg-black/20 rounded-xl mt-6">
                Histórico de consumo indisponível.
            </div>
        );
    }
    
    const maxVal = Math.max(...data.map(d => Math.max(d.download, d.upload)), 1);
    const width = 100;
    const height = 50; 
    const padding = 5;
    
    const getX = (index: number) => (index / (data.length - 1)) * (width - (padding * 2)) + padding;
    const getY = (value: number) => height - padding - (value / maxVal) * (height - (padding * 2));

    const getPath = (key: 'download' | 'upload') => {
        if (data.length < 2) return '';
        let d = `M ${getX(0)} ${getY(data[0][key])}`;
        for (let i = 1; i < data.length; i++) {
             d += ` L ${getX(i)} ${getY(data[i][key])}`;
        }
        return d;
    };
    
    const getAreaPath = (key: 'download' | 'upload') => `${getPath(key)} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return (
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mt-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Activity size={18} className="text-fiber-orange" /> Histórico de Consumo</h3>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto max-w-full">
                    <button onClick={() => setPeriod('daily')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${period === 'daily' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        Diário
                    </button>
                    <button onClick={() => setPeriod('weekly')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${period === 'weekly' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        Semanal
                    </button>
                    <button onClick={() => setPeriod('monthly')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${period === 'monthly' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        Mensal
                    </button>
                </div>
            </div>
            <div className="h-64 w-full relative group">
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-600 font-mono pointer-events-none z-0">
                    <span>{Math.round(maxVal)} GB</span><span>{Math.round(maxVal / 2)} GB</span><span>0 GB</span>
                </div>
                
                <div className="ml-8 h-full pb-6">
                    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradDownload" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E90FF" stopOpacity="0.3" /><stop offset="100%" stopColor="#1E90FF" stopOpacity="0" /></linearGradient>
                            <linearGradient id="gradUpload" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" /><stop offset="100%" stopColor="#FF6B00" stopOpacity="0" /></linearGradient>
                        </defs>
                        
                        <path d={getAreaPath('download')} fill="url(#gradDownload)" className="transition-all duration-500" />
                        <path d={getPath('download')} fill="none" stroke="#1E90FF" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 drop-shadow-lg" />
                        
                        <path d={getAreaPath('upload')} fill="url(#gradUpload)" className="transition-all duration-500" />
                        <path d={getPath('upload')} fill="none" stroke="#FF6B00" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 drop-shadow-lg" />
                        
                        {data.map((d, i) => (
                            <g key={i} className="group/point">
                                <rect x={getX(i) - (data.length > 20 ? 0.5 : 1)} y="0" width={data.length > 20 ? 1 : 2} height={height} fill="transparent" className="cursor-pointer" onMouseEnter={() => setActivePoint(d)} onMouseLeave={() => setActivePoint(null)} />
                                {data.length <= 40 && (
                                    <>
                                        <circle cx={getX(i)} cy={getY(d.download)} r={data.length > 20 ? 0.4 : 0.8} className="fill-[#1E90FF] opacity-0 group-hover/point:opacity-100 transition-opacity" />
                                        <circle cx={getX(i)} cy={getY(d.upload)} r={data.length > 20 ? 0.4 : 0.8} className="fill-[#FF6B00] opacity-0 group-hover/point:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </g>
                        ))}
                    </svg>
                </div>

                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-gray-500 font-medium px-2">
                    <span>{data[0]?.label}</span>
                    {data.length > 5 && <span>{data[Math.floor(data.length / 4)]?.label}</span>}
                    <span>{data[Math.floor(data.length / 2)]?.label}</span>
                    {data.length > 5 && <span>{data[Math.floor(data.length * 0.75)]?.label}</span>}
                    <span>{data[data.length - 1]?.label}</span>
                </div>

                {activePoint && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-neutral-900 border border-white/20 p-3 rounded-lg shadow-2xl z-10 pointer-events-none animate-fadeIn backdrop-blur-md min-w-[120px]">
                        <div className="text-xs font-bold text-white mb-1 border-b border-white/10 pb-1 text-center">{activePoint.label}</div>
                        <div className="flex items-center justify-between gap-4 text-xs text-fiber-blue mb-0.5">
                             <span>Download</span>
                             <span className="font-mono flex items-center gap-1"><ArrowDown size={10} /> {activePoint.download.toFixed(1)} GB</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-xs text-fiber-orange">
                             <span>Upload</span>
                             <span className="font-mono flex items-center gap-1"><ArrowUp size={10} /> {activePoint.upload.toFixed(1)} GB</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-fiber-blue/20">
                    <div className="w-2 h-2 rounded-full bg-fiber-blue"></div>
                    <span className="text-xs text-gray-300">Download</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-fiber-orange/20">
                    <div className="w-2 h-2 rounded-full bg-fiber-orange"></div>
                    <span className="text-xs text-gray-300">Upload</span>
                </div>
            </div>
        </div>
    );
};

// === MAIN COMPONENT ===
const ClientArea: React.FC = () => {
    // === STATE MANAGEMENT ===
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(() => {
        try {
            const cached = localStorage.getItem(DASH_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.contratos && parsed.clientes) return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const token = localStorage.getItem('authToken');
        return !!token;
    });

    const [isLoading, setIsLoading] = useState<boolean>(() => {
        const token = localStorage.getItem('authToken');
        const cached = localStorage.getItem(DASH_CACHE_KEY);
        if (!token) return false;
        if (cached) return false;
        return true;
    });

    const [isRefetching, setIsRefetching] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showLoginPass, setShowLoginPass] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isPixModalOpen, setPixModalOpen] = useState(false);
    const [activePixCode, setActivePixCode] = useState('');
    const [isPixCopied, setIsPixCopied] = useState(false);
    const [copiedBarcodeId, setCopiedBarcodeId] = useState<string | null>(null);
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('aberto');
    const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showNewPass, setShowNewPass] = useState(false);
    const [actionStatus, setActionStatus] = useState<{ [key: string]: { status: 'idle' | 'loading' | 'success' | 'error', message?: string } }>({});
    const [diagResult, setDiagResult] = useState<{ download: string, upload: string } | null>(null);
    const [selectedLoginConsumo, setSelectedLoginConsumo] = useState<number | 'total'>('total');
    const [loginView, setLoginView] = useState<'login' | 'forgot'>('login');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [recoveryMessage, setRecoveryMessage] = useState('');
    const [loadingPix, setLoadingPix] = useState<{[key: string]: boolean}>({});

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'bot', text: 'Olá! Sou a IA da Fiber.Net. Como posso ajudar você hoje?', timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatTyping, setIsChatTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Efeito para rolar para o topo ao mudar de aba
    useEffect(() => {
        window.scrollTo(0, 0); 
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setIsRefetching(true);
        try {
            const data = await apiService.getDashboard();
            setDashboardData(data);
            setIsAuthenticated(true);
            localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Erro ao atualizar dashboard:", error);
            if (!dashboardData) {
                handleLogout();
            }
        } finally {
            setIsRefetching(false);
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const email = emailInput;

        try {
            const loginResponse = await apiService.login({ email, password });
            if (!loginResponse.token) throw new Error('Token inválido.');

            const dashData = await apiService.getDashboard();
            setDashboardData(dashData);
            localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(dashData));

            if (rememberMe) localStorage.setItem('fiber_saved_email', email);
            else localStorage.removeItem('fiber_saved_email');

            setIsAuthenticated(true);
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error: any) {
            setLoginError(error.message || 'Falha na autenticação.');
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setDashboardData(null);
        setLoginView('login');
    };

    const performLoginAction = async (loginId: string | number, action: 'limpar-mac' | 'desconectar' | 'diagnostico') => {
        const id = Number(loginId);
        setActionStatus(prev => ({ ...prev, [loginId]: { status: 'loading' as const } }));
        setDiagResult(null);

        try {
            const data = await apiService.performLoginAction(id, action);
            if (action === 'diagnostico' && data.consumo) setDiagResult(data.consumo);
            setActionStatus(prev => ({ ...prev, [loginId]: { status: 'success' as const, message: data.message } }));
        } catch (error: any) {
            setActionStatus(prev => ({ ...prev, [loginId]: { status: 'error' as const, message: error.message } }));
        } finally {
             setTimeout(() => setActionStatus(prev => ({ ...prev, [loginId]: { status: 'idle' as const } })), 3000);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordChangeStatus(null);
        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get('novaSenha') as string;

        try {
            const data = await apiService.changePassword(newPassword);
            setPasswordChangeStatus({ type: 'success', message: data.message });
            e.currentTarget.reset();
        } catch (error: any) {
            setPasswordChangeStatus({ type: 'error', message: error.message });
        }
    };
    
    const handleRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRecoveryStatus('loading');
        try {
            const formData = new FormData(e.currentTarget);
            const data = await apiService.recoverPassword(formData.get('recoveryEmail') as string);
            setRecoveryStatus('success');
            setRecoveryMessage(data.message);
        } catch (e: any) {
            setRecoveryStatus('error');
            setRecoveryMessage(e.message);
        }
    }

    const processMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: text, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMsg]);
        setIsChatTyping(true);

        try {
            const apiKey = process.env.API_KEY;
            
            if (!apiKey) {
                // Mensagem amigável caso a chave não esteja configurada no ambiente
                throw new Error("API Key não configurada. Por favor, entre em contato com o suporte.");
            }

            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: text,
                config: {
                    systemInstruction: `Você é o assistente virtual da Fiber.Net Telecom. 
                    Seu nome é Fiber.IA.
                    Você deve ser educado, prestativo e focar em suporte técnico de internet e questões financeiras básicas.
                    A empresa oferece planos de fibra óptica.
                    
                    IMPORTANTE: Se o usuário perguntar se um aplicativo ou serviço (como WhatsApp, Instagram, Facebook, Bancos, etc) caiu ou está fora do ar, VOCÊ DEVE usar a ferramenta de busca do Google para verificar sites como DownDetector, G1, TechTudo ou notícias recentes.
                    Responda com base no que encontrar na busca. Se encontrar relatos de queda, informe ao usuário e forneça as fontes.
                    
                    Se o usuário relatar lentidão, sugira reiniciar o modem e testar via cabo.
                    Se perguntar sobre faturas, oriente a baixar na aba Faturas.

                    Não invente dados de clientes.
                    Se não souber responder, sugira contato via WhatsApp ${CONTACT_INFO.whatsapp}.`,
                    tools: [{ googleSearch: {} }],
                }
            });

            const botText = response.text || "Desculpe, não consegui processar sua resposta no momento.";
            
            let sources: { title: string; url: string }[] = [];
            if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                sources = response.candidates[0].groundingMetadata.groundingChunks
                    .map((chunk: any) => {
                        if (chunk.web?.uri && chunk.web?.title) {
                            return { title: chunk.web.title, url: chunk.web.uri };
                        }
                        return null;
                    })
                    .filter((s: any) => s !== null);
            }

            const botMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'bot', 
                text: botText, 
                timestamp: new Date(),
                sources: sources
            };
            setChatMessages(prev => [...prev, botMsg]);

        } catch (error: any) {
            console.error("Gemini AI Error:", error);
            const errorText = error.message?.includes("API Key") 
                ? "O serviço de IA está temporariamente indisponível. Por favor, tente novamente mais tarde." 
                : "Desculpe, estou enfrentando instabilidade técnica. Por favor, tente novamente mais tarde ou contate o suporte humano.";
                
            const errorMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'bot', 
                text: errorText, 
                timestamp: new Date() 
            };
            setChatMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsChatTyping(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = chatInput;
        setChatInput(''); 
        await processMessage(text);
    };

    const handleSuggestionClick = (suggestion: string) => {
        processMessage(suggestion);
    };

    useEffect(() => {
        const saved = localStorage.getItem('fiber_saved_email');
        if (saved) { setEmailInput(saved); setRememberMe(true); }
        if (isAuthenticated) {
            fetchDashboardData();
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'ai_support' && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, activeTab]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedBarcodeId(id);
        setTimeout(() => setCopiedBarcodeId(null), 2000);
    };
    const handleOpenPixModal = (code: string) => {
        setActivePixCode(code);
        setPixModalOpen(true);
        setIsPixCopied(false);
    };
    const handleCopyPix = () => {
        navigator.clipboard.writeText(activePixCode);
        setIsPixCopied(true);
        setTimeout(() => setIsPixCopied(false), 2000);
    };

    // Nova função para buscar PIX dinamicamente
    const fetchPixCode = async (faturaId: number) => {
        if (loadingPix[faturaId]) return;
      
        setLoadingPix(prev => ({ ...prev, [faturaId]: true }));
      
        try {
          const pixCode = await apiService.getPixCode(faturaId);
          
          if (pixCode) {
            // Atualizar estado local para manter consistência
            setDashboardData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    faturas: prev.faturas.map(f => Number(f.id) === Number(faturaId) ? { ...f, pix_qrcode: pixCode } : f)
                };
            });
            setActivePixCode(pixCode);
            setPixModalOpen(true);
          } else {
             alert('Código PIX não disponível para esta fatura no momento.');
          }
        } catch (error) {
          console.error('Erro ao buscar PIX:', error);
          alert('Erro ao buscar o código PIX. Tente novamente ou use o código de barras.');
        } finally {
          setLoadingPix(prev => ({ ...prev, [faturaId]: false }));
        }
    };

    const TABS = [
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'ai_support', label: 'Suporte IA', icon: Bot, badge: 'NOVO' }, 
      { id: 'invoices', label: 'Faturas', icon: FileText },
      { id: 'connections', label: 'Conexões', icon: Wifi },
      { id: 'consumption', label: 'Extrato', icon: BarChart3 },
      { id: 'contracts', label: 'Contratos', icon: FileSignature },
      { id: 'notes', label: 'Notas Fiscais', icon: ScrollText },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ];
    
    // --- RENDER ---
    if (isLoading) return <div className="min-h-screen bg-fiber-dark flex items-center justify-center"><Loader2 size={48} className="text-fiber-orange animate-spin" /></div>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-fiber-dark flex items-center justify-center p-4 animate-fadeIn">
                <div className="w-full max-w-md bg-fiber-card p-8 rounded-2xl border border-white/10 shadow-2xl">
                    {loginView === 'login' ? (
                        <>
                            <h2 className="text-3xl font-bold text-white text-center mb-2">Área do Cliente</h2>
                            <p className="text-gray-400 text-center mb-8">Acesse sua conta para gerenciar seus serviços.</p>
                            <form onSubmit={handleLogin} className="space-y-6">
                                {loginError && (<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3"><AlertCircle className="text-red-500 w-5 h-5 mt-0.5" /><p className="text-red-400 text-sm">{loginError}</p></div>)}
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="email" placeholder="Seu e-mail" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 text-white focus:ring-1 focus:ring-fiber-orange" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type={showLoginPass ? 'text' : 'password'} name="password" placeholder="Sua senha" required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 pr-10 text-white focus:ring-1 focus:ring-fiber-orange" />
                                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><Eye size={18}/></button>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="form-checkbox h-4 w-4 text-fiber-orange rounded bg-neutral-900" />Salvar login</label>
                                    <button type="button" onClick={() => setLoginView('forgot')} className="text-fiber-orange hover:underline">Esqueci a senha</button>
                                </div>
                                <Button type="submit" variant="primary" fullWidth disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Acessar'}</Button>
                            </form>
                        </>
                    ) : (
                         <>
                             <button onClick={() => setLoginView('login')} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={16} /> Voltar</button>
                             <h2 className="text-2xl font-bold text-white text-center mb-8">Recuperar Senha</h2>
                             {recoveryStatus !== 'success' ? (
                                <form onSubmit={handleRecovery} className="space-y-6">
                                    <input type="email" name="recoveryEmail" placeholder="E-mail do cadastro" required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white" />
                                    {recoveryStatus === 'error' && <p className="text-red-400 text-sm text-center">{recoveryMessage}</p>}
                                    <Button type="submit" variant="primary" fullWidth disabled={recoveryStatus === 'loading'}>{recoveryStatus === 'loading' ? <Loader2 className="animate-spin mx-auto" /> : 'Enviar'}</Button>
                                </form>
                             ) : (
                                 <div className="text-center"><CheckCircle size={32} className="text-green-500 mx-auto mb-4"/><p className="text-white">{recoveryMessage}</p><Button variant="outline" fullWidth onClick={() => setLoginView('login')} className="mt-4">Voltar</Button></div>
                             )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            Olá, {dashboardData?.clientes[0]?.nome?.split(' ')[0]}!
                            {isRefetching && <Loader2 size={16} className="text-fiber-orange animate-spin" />}
                        </h1>
                        <p className="text-gray-400">Bem-vindo(a) à sua central de controle unificada.</p>
                    </div>
                    <Button onClick={handleLogout} variant="secondary" className="!py-2 !px-4 text-sm gap-2"><LogOut size={16} /> Sair</Button>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-1/4 lg:sticky top-24 self-start">
                        <div className="bg-fiber-card border border-white/10 rounded-2xl p-4 space-y-2">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-colors font-medium text-sm ${activeTab === tab.id ? 'bg-fiber-orange text-white shadow-md' : 'text-gray-300 hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-3">
                                        <tab.icon size={18} /> {tab.label}
                                    </div>
                                    {tab.badge && (
                                        <span className="bg-white text-fiber-orange text-[10px] font-bold px-1.5 py-0.5 rounded">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <main className="w-full lg:w-3/4">
                        <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 md:p-8 min-h-[500px] animate-fadeIn">
                            
                            {/* === DASHBOARD === */}
                            {activeTab === 'dashboard' && dashboardData && (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                        <LayoutDashboard className="text-fiber-orange"/> Visão Geral
                                    </h2>
                                    
                                    <AIInsights data={dashboardData.ai_analysis} />

                                    {/* ✅ VERIFICAR SE HÁ CONTRATOS ATIVOS */}
                                    {dashboardData.contratos.length === 0 ? (
                                        <div className="bg-neutral-900 border border-white/10 rounded-xl p-8 text-center">
                                            <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
                                            <p className="text-white font-bold mb-2">Nenhum contrato ativo encontrado</p>
                                            <p className="text-gray-400 text-sm">Entre em contato com o suporte para mais informações.</p>
                                        </div>
                                    ) : (
                                        dashboardData.contratos.map((contrato) => {
                                            if (contrato.status !== 'A') {
                                                console.warn('⚠️ Contrato não ativo detectado:', contrato.id);
                                                return null;
                                            }

                                            const loginsDoContrato = dashboardData.logins.filter(l => 
                                                Number(l.contrato_id) === Number(contrato.id)
                                            );
                                            
                                            const faturasDoContrato = dashboardData.faturas.filter(f => 
                                                f.contrato_id ? Number(f.contrato_id) === Number(contrato.id) : true
                                            ).filter(f => f.status === 'A'); 
                                            
                                            const notasDoContrato = dashboardData.notas?.filter(n => 
                                                n.contrato_id ? Number(n.contrato_id) === Number(contrato.id) : true
                                            ) || [];

                                            return (
                                                <div key={contrato.id} className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-6 shadow-lg">
                                                    
                                                    {/* CABEÇALHO DO CONTRATO */}
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/5 pb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                                <FileSignature size={20} className="text-fiber-orange" />
                                                                {contrato.descricao_aux_plano_venda || `Contrato #${contrato.id}`}
                                                            </h3>
                                                            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                                                <MapPin size={14} className="text-gray-500" /> 
                                                                {contrato.endereco || 'Endereço não informado'}
                                                                {contrato.bairro && ` - ${contrato.bairro}`}
                                                                {contrato.cidade && `, ${contrato.cidade}`}
                                                            </p>
                                                        </div>
                                                        <span className="mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                                                            ✓ ATIVO
                                                        </span>
                                                    </div>

                                                    {/* CONEXÕES (ONT) */}
                                                    <div className="mb-8">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                            <Router size={14} /> Conexões e Equipamentos
                                                        </h4>
                                                        
                                                        {loginsDoContrato.length > 0 ? (
                                                            <div className="grid grid-cols-1 gap-4">
                                                                {loginsDoContrato.map(login => (
                                                                    <div key={login.id} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                                                        <div className="flex items-center gap-4">
                                                                             <div className={`w-3 h-3 rounded-full ${login.online === 'S' ? 'bg-fiber-green animate-pulse' : 'bg-gray-500'}`} title={login.online === 'S' ? 'Online' : 'Offline'}></div>
                                                                             <div>
                                                                                 <p className="font-bold text-white text-sm">{login.login}</p>
                                                                                 <p className="text-xs text-gray-500 font-mono mt-0.5">IP: {login.ip_privado || 'N/A'}</p>
                                                                             </div>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-6 text-xs text-gray-400">
                                                                            <div className="flex items-center gap-2" title="Modelo da ONU">
                                                                                <Router size={14}/> {login.ont_modelo || 'N/A'}
                                                                            </div>
                                                                            <div className="flex items-center gap-2" title="Sinal Óptico (RX)">
                                                                                <Activity size={14}/> 
                                                                                <span className={`font-mono ${
                                                                                !login.sinal_ultimo_atendimento || login.sinal_ultimo_atendimento === 'N/A' 
                                                                                    ? 'text-gray-500' 
                                                                                    : parseFloat(login.sinal_ultimo_atendimento) < -27 
                                                                                    ? 'text-red-400' 
                                                                                    : parseFloat(login.sinal_ultimo_atendimento) < -25
                                                                                        ? 'text-yellow-400'
                                                                                        : 'text-fiber-green'
                                                                                }`}>
                                                                                {login.sinal_ultimo_atendimento || 'N/A'} 
                                                                                </span>
                                                                            </div>
                                                                             <div className="flex items-center gap-2" title="Tempo Conectado">
                                                                                <Clock size={14}/> {login.tempo_conectado || 'Recente'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                                                                <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-yellow-400 font-bold text-sm">Nenhuma conexão ativa</p>
                                                                    <p className="text-gray-400 text-xs mt-1">Não há logins vinculados a este contrato.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* FATURAS PENDENTES */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <FileText size={14} /> Faturas Pendentes
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {faturasDoContrato.length > 0 ? (
                                                                    faturasDoContrato.map(fatura => {
                                                                        const isLoadingPixForThis = loadingPix[fatura.id] || false;
                                                                        return (
                                                                            <div key={fatura.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border-l-2 border-fiber-orange hover:bg-white/10 transition-colors">
                                                                                <div>
                                                                                    <p className="text-white font-bold text-sm">R$ {fatura.valor}</p>
                                                                                    <p className="text-[10px] text-gray-400">
                                                                                        Venc: {fatura.data_vencimento}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            if (fatura.pix_qrcode) {
                                                                                                handleOpenPixModal(fatura.pix_qrcode);
                                                                                            } else {
                                                                                                fetchPixCode(Number(fatura.id));
                                                                                            }
                                                                                        }}
                                                                                        disabled={isLoadingPixForThis}
                                                                                        className="text-[10px] bg-fiber-green/20 text-fiber-green px-2 py-1 rounded hover:bg-fiber-green/30 transition font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        {isLoadingPixForThis ? (
                                                                                            <><Loader2 size={10} className="animate-spin"/> ...</>
                                                                                        ) : (
                                                                                            <><QrCode size={10}/> PIX</>
                                                                                        )}
                                                                                    </button>
                                                                                    
                                                                                    {fatura.linha_digitavel && (
                                                                                        <button 
                                                                                            onClick={() => handleCopy(fatura.linha_digitavel!, String(fatura.id))} 
                                                                                            className="text-[10px] bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20 transition flex items-center gap-1"
                                                                                        >
                                                                                            {copiedBarcodeId === String(fatura.id) ? (
                                                                                                <><CheckCircle size={10}/> Copiado</>
                                                                                            ) : (
                                                                                                <><Copy size={10}/> Código</>
                                                                                            )}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <p className="text-gray-500 text-sm italic flex items-center gap-2">
                                                                        <CheckCircle size={14} className="text-green-500"/> 
                                                                        Nenhuma fatura pendente
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* NOTAS FISCAIS */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <ScrollText size={14} /> Últimas Notas Fiscais
                                                            </h4>
                                                            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                                                                {notasDoContrato.length > 0 ? (
                                                                    notasDoContrato.slice(0,3).map(nota => (
                                                                        <div key={nota.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0">
                                                                            <div>
                                                                                <p className="text-xs text-white">NF #{nota.numero_nota}</p>
                                                                                <p className="text-[10px] text-gray-500">{nota.data_emissao}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-xs font-mono text-gray-300">R$ {nota.valor}</span>
                                                                                {nota.link_pdf && (
                                                                                    <a 
                                                                                        href={nota.link_pdf} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer" 
                                                                                        className="text-fiber-blue hover:text-white transition-colors" 
                                                                                        title="Baixar PDF"
                                                                                    >
                                                                                        <Download size={14} />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-gray-500 text-sm italic">Nenhuma nota disponível</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        }).filter(Boolean) 
                                    )}
                                </div>
                            )}

                            {activeTab === 'ai_support' && (
                                <div className="h-[600px] flex flex-col">
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                                <Bot className="text-fiber-orange" /> Suporte Inteligente
                                            </h2>
                                            <p className="text-gray-400 text-sm">Tire dúvidas sobre sua fatura, conexão e mais.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow bg-neutral-900 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                                        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-fiber-orange/20">
                                            {/* ÁREA DE SUGESTÕES INICIAIS */}
                                            {chatMessages.length <= 1 && !isChatTyping && (
                                                <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                                                    <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                        <HelpCircle size={16} className="text-fiber-orange"/> Sugestões de Dúvidas
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {CHAT_SUGGESTIONS.map((suggestion, index) => (
                                                            <button 
                                                                key={index}
                                                                onClick={() => handleSuggestionClick(suggestion.label)}
                                                                className="flex items-center gap-3 p-3 bg-neutral-800 hover:bg-neutral-700 border border-white/5 hover:border-fiber-orange/50 rounded-xl text-left transition-all group"
                                                            >
                                                                <div className="p-2 bg-fiber-orange/10 rounded-lg group-hover:bg-fiber-orange group-hover:text-white text-fiber-orange transition-colors">
                                                                    <suggestion.icon size={18} />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-300 group-hover:text-white">{suggestion.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {chatMessages.map((msg) => (
                                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl p-4 ${
                                                        msg.sender === 'user' 
                                                            ? 'bg-fiber-orange text-white rounded-br-none' 
                                                            : 'bg-white/10 text-gray-200 rounded-bl-none'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                                        {msg.sources && msg.sources.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
                                                                    <Search size={10} /> Fontes Pesquisadas:
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {msg.sources.map((source, idx) => (
                                                                        <a 
                                                                            key={idx} 
                                                                            href={source.url} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-full text-fiber-blue truncate max-w-[200px] flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <Link2 size={8} /> {source.title}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <span className="text-[10px] opacity-50 mt-1 block text-right">
                                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {isChatTyping && (
                                                <div className="flex justify-start">
                                                    <div className="bg-white/10 text-gray-400 rounded-2xl rounded-bl-none p-4 text-xs italic flex items-center gap-2">
                                                        <Loader2 size={12} className="animate-spin" /> Fiber.IA está digitando...
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={handleSendMessage} className="p-4 bg-neutral-800 border-t border-white/5 flex gap-2">
                                            <input 
                                                type="text" 
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Digite sua dúvida aqui..."
                                                className="flex-grow bg-neutral-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange"
                                            />
                                            <Button type="submit" variant="primary" className="!px-4" disabled={!chatInput.trim() || isChatTyping}>
                                                <Send size={18} />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'invoices' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Todas as Faturas</h2>
                                    <div className="flex items-center gap-2 mb-6 bg-neutral-900 p-1.5 rounded-full border border-white/10 w-fit">
                                        {['aberto', 'pago', 'todas'].map(s => (
                                            <button key={s} onClick={() => setInvoiceStatusFilter(s)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${invoiceStatusFilter === s ? 'bg-fiber-orange text-white' : 'text-gray-400'}`}>{s.toUpperCase()}</button>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        {(dashboardData?.faturas || []).filter(inv => {
                                            if (invoiceStatusFilter === 'todas') return true;
                                            if (invoiceStatusFilter === 'aberto') return inv.status === 'A';
                                            if (invoiceStatusFilter === 'pago') return inv.status !== 'A';
                                            return true;
                                        }).map(invoice => (
                                            <div key={invoice.id} className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                                                 <div>
                                                     <p className="font-bold text-white">R$ {invoice.valor}</p>
                                                     <p className="text-xs text-gray-500">{invoice.data_vencimento}</p>
                                                     <span className={`text-[10px] uppercase font-bold ${invoice.status === 'A' ? 'text-red-400' : 'text-green-500'}`}>{invoice.status === 'A' ? 'Aberto' : 'Pago'}</span>
                                                 </div>
                                                 <div className="flex gap-2">
                                                     {invoice.linha_digitavel && <Button variant="secondary" onClick={() => handleCopy(invoice.linha_digitavel!, String(invoice.id))} className="!py-1 !px-3 !text-xs">Copiar</Button>}
                                                     <Button variant="outline" className="!py-1 !px-3 !text-xs" onClick={() => fetchPixCode(Number(invoice.id))}>PIX</Button>
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'consumption' && (
                                <div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                        <h2 className="text-2xl font-bold text-white">Extrato de Uso</h2>
                                        
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Router size={16} className="text-fiber-orange" />
                                            </div>
                                            <select 
                                                value={selectedLoginConsumo} 
                                                onChange={(e) => setSelectedLoginConsumo(e.target.value === 'total' ? 'total' : Number(e.target.value))}
                                                className="bg-neutral-900 border border-white/10 text-white text-sm rounded-lg pl-10 pr-8 py-2.5 focus:ring-fiber-orange focus:border-fiber-orange block w-full appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
                                            >
                                                <option value="total">Visão Geral (Todos)</option>
                                                {dashboardData?.logins.map(l => (
                                                    <option key={l.id} value={l.id}>{l.login}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <ChevronDown size={14} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <ConsumptionChart 
                                        history={
                                            selectedLoginConsumo === 'total' 
                                            ? dashboardData?.consumo.history 
                                            : dashboardData?.logins.find(l => l.id === selectedLoginConsumo)?.history || dashboardData?.consumo.history
                                        } 
                                    />
                                    
                                    <p className="text-xs text-gray-500 mt-4 text-center">
                                        * Dados atualizados a cada 15 minutos. Para diagnóstico em tempo real, use a aba "Conexões".
                                    </p>
                                </div>
                            )}
                            
                            {activeTab === 'contracts' && dashboardData && (
                                <div className="space-y-8">
                                    <div className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-lg font-sans">
                                        <div className="bg-nubank-primary p-6 flex justify-between items-center text-white">
                                            <div className="flex items-center gap-4">
                                                <FileText size={40} className="opacity-80" />
                                                <div>
                                                    <h2 className="text-2xl font-bold">Contratos</h2>
                                                    <p className="text-purple-200 text-sm">Gerencie seus contratos.</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold">{dashboardData.contratos.filter(c => c.status === 'A').length}</div>
                                                <div className="text-xs text-purple-200 uppercase tracking-wider">contratos ativos</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <div className="text-center md:text-left">Status</div>
                                            <div className="md:col-span-2">Plano</div>
                                            <div className="text-center">Ações</div>
                                        </div>

                                        {dashboardData.contratos.map((contrato) => (
                                            <div key={contrato.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-center md:justify-start">
                                                    <div className={`w-8 h-8 rounded flex items-center justify-center ${contrato.status === 'A' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                        <ThumbsUp size={16} fill="currentColor" />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 font-medium text-gray-700">
                                                    {contrato.descricao_aux_plano_venda || 'Plano Padrão'}
                                                </div>
                                                <div className="flex justify-center gap-3 text-gray-400">
                                                    <button 
                                                        onClick={() => contrato.pdf_link && window.open(contrato.pdf_link, '_blank')}
                                                        className="hover:text-gray-600 transition-colors" 
                                                        title="Imprimir Contrato"
                                                        disabled={!contrato.pdf_link}
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* CONNECTIONS TAB */}
                            {activeTab === 'connections' && dashboardData && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Minhas Conexões</h2>
                                    <div className="space-y-6">
                                        {dashboardData.logins.map(login => (
                                            <div key={login.id} className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                                                    <h3 className="text-lg font-bold text-white">{login.login}</h3>
                                                    <div className={`flex items-center gap-2 font-bold text-sm ${login.online === 'S' ? 'text-fiber-green' : 'text-gray-500'}`}>
                                                        <div className={`w-2.5 h-2.5 rounded-full ${login.online === 'S' ? 'bg-fiber-green animate-pulse' : 'bg-gray-500'}`}></div>
                                                        {login.online === 'S' ? 'Online' : 'Offline'}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                                                    <div className="flex items-center gap-2 text-gray-400"><Server size={14}/> <strong>ONT:</strong> <span className="text-white">{login.sinal_ultimo_atendimento || 'N/A'}</span></div>
                                                    <div className="flex items-center gap-2 text-gray-400"><Clock size={14}/> <strong>Uptime:</strong> <span className="text-white">{login.tempo_conectado || 'N/A'}</span></div>
                                                    
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Activity size={14}/> <strong>IP Privado:</strong> 
                                                        <span className="text-white font-mono text-xs">{login.ip_privado || '--'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <Button onClick={() => performLoginAction(login.id, 'limpar-mac')} variant="secondary" className="!text-xs !py-2 !px-4 gap-2" disabled={actionStatus[login.id]?.status === 'loading'}>{actionStatus[login.id]?.status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <X size={14}/>} Limpar MAC</Button>
                                                    <Button onClick={() => performLoginAction(login.id, 'desconectar')} variant="secondary" className="!text-xs !py-2 !px-4 gap-2" disabled={actionStatus[login.id]?.status === 'loading'}>{actionStatus[login.id]?.status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Power size={14}/>} Desconectar</Button>
                                                    <Button onClick={() => performLoginAction(login.id, 'diagnostico')} variant="outline" className="!text-xs !py-2 !px-4 gap-2" disabled={actionStatus[login.id]?.status === 'loading'}>{actionStatus[login.id]?.status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14}/>} Diagnóstico</Button>
                                                </div>
                                                {actionStatus[login.id]?.status === 'success' && <p className="text-green-500 text-xs mt-3">{actionStatus[login.id]?.message}</p>}
                                                {actionStatus[login.id]?.status === 'error' && <p className="text-red-500 text-xs mt-3">{actionStatus[login.id]?.message}</p>}
                                                {diagResult && <p className="text-blue-400 text-xs mt-3 font-mono">Consumo Atual: DL {diagResult.download} / UL {diagResult.upload}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'notes' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Notas Fiscais</h2>
                                    <div className="space-y-2">
                                        {(dashboardData?.notas || []).map(nota => (
                                            <div key={nota.id} className="flex justify-between items-center p-4 bg-neutral-900 border border-white/5 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-bold text-white">Nota #{nota.numero_nota}</p>
                                                    <p className="text-xs text-gray-500">{nota.data_emissao}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-mono text-white">R$ {nota.valor}</span>
                                                    {nota.link_pdf && <a href={nota.link_pdf} target="_blank" className="text-fiber-blue hover:underline text-xs flex items-center gap-1"><Download size={12}/> PDF</a>}
                                                </div>
                                            </div>
                                        ))}
                                        {(!dashboardData?.notas || dashboardData.notas.length === 0) && <p className="text-gray-500 italic">Nenhuma nota fiscal encontrada.</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>
                                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-md">
                                        <h3 className="font-bold text-white mb-4">Trocar Senha</h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <input type={showNewPass ? 'text' : 'password'} name="novaSenha" placeholder="Nova senha" required className="w-full bg-fiber-dark border border-white/10 rounded p-2 text-white"/>
                                            <Button type="submit" variant="primary">Salvar</Button>
                                        </form>
                                        {passwordChangeStatus && <p className={`mt-2 text-sm ${passwordChangeStatus.type==='success'?'text-green-400':'text-red-400'}`}>{passwordChangeStatus.message}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {isPixModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full relative">
                        <button onClick={() => setPixModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-bold text-white text-center mb-4">Pagamento PIX</h3>
                        <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4"><div className="w-48 h-48 bg-neutral-800 flex items-center justify-center"><QrCode size={100} className="text-white"/></div></div>
                        <div className="bg-neutral-900 p-2 rounded mb-4 overflow-hidden"><p className="text-xs text-gray-500 font-mono truncate">{activePixCode}</p></div>
                        <Button onClick={handleCopyPix} fullWidth className="gap-2 !bg-fiber-green hover:!bg-green-600">{isPixCopied ? 'Copiado!' : 'Copiar Código'}</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientArea;