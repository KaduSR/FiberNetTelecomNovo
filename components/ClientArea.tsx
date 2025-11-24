import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Shield, Eye, EyeOff, Mail, Wifi, Activity, 
  Router, Unlock, Clock, MapPin, Settings, KeyRound, Home, ArrowUp, ArrowDown, Globe, MessageSquare, Bot, Send, LayoutDashboard, Ban, ChevronRight, Star,
  FileSignature, BarChart3, ScrollText, DownloadCloud
} from 'lucide-react';
import Button from './Button';
import { Invoice, ConsumptionHistory, ConsumptionPoint } from '../types';

// === API Configuration ===
const API_BASE_URL = '/api'; // Uses the Vite proxy in development

// === HELPERS & TYPES ===
const safeString = (value: any, fallback = ''): string => {
    if (value === null || value === undefined) return fallback;
    return String(value);
};

const formatBytes = (bytes: number | string, decimals = 2) => {
    const val = Number(bytes);
    if (isNaN(val) || val === 0) return '0 GB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(val) / Math.log(k));
    return `${parseFloat((val / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getStatusContrato = (status: string) => {
    const map: Record<string, string> = { 'A': 'Ativo', 'S': 'Suspenso', 'C': 'Cancelado' };
    return map[String(status).toUpperCase()] || 'Indefinido';
};

interface DashboardData {
    cliente: { nome: string; endereco: string; };
    contrato: { plano: string; velocidade: string; status: string; };
    conexao: { online: boolean; ip: string; uptime: string; };
    consumo: { total_download_bytes: number; total_upload_bytes: number; history: ConsumptionHistory; };
    faturas: Invoice[];
    contratoPdf: string | null;
}

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

// === SUB-COMPONENT: CONSUMPTION CHART ===
const ConsumptionChart: React.FC<{ history?: ConsumptionHistory }> = ({ history }) => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [activePoint, setActivePoint] = useState<ConsumptionPoint | null>(null);

    const data = history?.[period] || [];
    
    if(!history || data.length === 0){
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 bg-black/20 rounded-xl mt-6">
                Histórico de consumo indisponível.
            </div>
        );
    }
    
    const maxVal = Math.max(...data.map(d => Math.max(d.download, d.upload)), 1);
    const width = 100, height = 100, padding = 10;
    
    const getX = (index: number) => (index / (data.length - 1)) * (width - (padding * 2)) + padding;
    const getY = (value: number) => height - padding - (value / maxVal) * (height - (padding * 2));

    const getPath = (key: 'download' | 'upload') => {
        let d = `M ${getX(0)} ${getY(data[0][key])}`;
        for (let i = 1; i < data.length; i++) d += ` L ${getX(i)} ${getY(data[i][key])}`;
        return d;
    };
    
    const getAreaPath = (key: 'download' | 'upload') => `${getPath(key)} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return (
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6 mt-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Activity size={18} className="text-fiber-orange" /> Histórico de Consumo</h3>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                    {(['daily', 'weekly', 'monthly'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === p ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : 'Mensal'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-64 w-full relative group">
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-500 font-mono pointer-events-none z-0">
                    <span>{Math.round(maxVal)} GB</span><span>{Math.round(maxVal / 2)} GB</span><span>0 GB</span>
                </div>
                <div className="ml-8 h-full">
                    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradDownload" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E90FF" stopOpacity="0.3" /><stop offset="100%" stopColor="#1E90FF" stopOpacity="0" /></linearGradient>
                            <linearGradient id="gradUpload" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" /><stop offset="100%" stopColor="#FF6B00" stopOpacity="0" /></linearGradient>
                        </defs>
                        <path d={getAreaPath('download')} fill="url(#gradDownload)" className="transition-all duration-500" />
                        <path d={getPath('download')} fill="none" stroke="#1E90FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 drop-shadow-lg" />
                        <path d={getAreaPath('upload')} fill="url(#gradUpload)" className="transition-all duration-500" />
                        <path d={getPath('upload')} fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 drop-shadow-lg" />
                        {data.map((d, i) => (
                            <g key={i} className="group/point">
                                <rect x={getX(i) - 2} y="0" width="4" height="100" fill="transparent" className="cursor-pointer" onMouseEnter={() => setActivePoint(d)} onMouseLeave={() => setActivePoint(null)} />
                                <circle cx={getX(i)} cy={getY(d.download)} r="1.5" className="fill-[#1E90FF] opacity-0 group-hover/point:opacity-100" />
                                <circle cx={getX(i)} cy={getY(d.upload)} r="1.5" className="fill-[#FF6B00] opacity-0 group-hover/point:opacity-100" />
                            </g>
                        ))}
                    </svg>
                </div>
                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-gray-400 font-medium px-2">
                    {data.map((d, i) => <span key={i} className="text-center w-8 truncate">{d.label}</span>)}
                </div>
                {activePoint && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-neutral-900 border border-white/20 p-3 rounded-lg shadow-2xl z-10 pointer-events-none animate-fadeIn backdrop-blur-md">
                        <div className="text-xs font-bold text-white mb-1 border-b border-white/10 pb-1">{activePoint.label}</div>
                        <div className="flex items-center gap-2 text-xs text-fiber-blue"><ArrowDown size={12} /> {activePoint.download.toFixed(2)} GB</div>
                        <div className="flex items-center gap-2 text-xs text-fiber-orange"><ArrowUp size={12} /> {activePoint.upload.toFixed(2)} GB</div>
                    </div>
                )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-fiber-blue"></div><span className="text-xs text-gray-400">Download</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-fiber-orange"></div><span className="text-xs text-gray-400">Upload</span></div>
            </div>
        </div>
    );
};


// === MAIN COMPONENT ===
const ClientArea: React.FC = () => {
    // === STATE MANAGEMENT ===
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loginError, setLoginError] = useState('');
    const [showLoginPass, setShowLoginPass] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isPixModalOpen, setPixModalOpen] = useState(false);
    const [activePixCode, setActivePixCode] = useState('');
    const [isPixCopied, setIsPixCopied] = useState(false);
    const [copiedBarcodeId, setCopiedBarcodeId] = useState<string | null>(null);
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('aberto');
    const [favoriteInvoices, setFavoriteInvoices] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('favoriteInvoices');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // Chat states
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Password change states
    const [showNewPass, setShowNewPass] = useState(false);
    const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // === API FUNCTIONS ===
    
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error(error);
            handleLogout(); // Log out if data fetch fails
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');
            
            localStorage.setItem('authToken', data.token);
            setIsAuthenticated(true);
            await fetchDashboardData();
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            setLoginError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setDashboardData(null);
    };

    const handleDownloadBoleto = async (id: string | number) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/boleto/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to download boleto');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fatura_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert('Não foi possível baixar o boleto.');
        }
    };
    
    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordChangeStatus(null);
        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get('novaSenha') as string;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/trocar-senha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to change password');
            setPasswordChangeStatus({ type: 'success', message: data.message });
            e.currentTarget.reset();
        } catch (error: any) {
            setPasswordChangeStatus({ type: 'error', message: error.message });
        } finally {
            setTimeout(() => setPasswordChangeStatus(null), 5000);
        }
    };

    // === EFFECTS ===

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            fetchDashboardData().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('favoriteInvoices', JSON.stringify(Array.from(favoriteInvoices)));
    }, [favoriteInvoices]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, isBotTyping]);

    // === OTHER HANDLERS ===

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

    const toggleFavorite = (id: string) => {
        setFavoriteInvoices(prev => {
            const newFavorites = new Set(prev);
            newFavorites.has(id) ? newFavorites.delete(id) : newFavorites.add(id);
            return newFavorites;
        });
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isBotTyping) return;

        const newUserMessage: ChatMessage = { id: Date.now(), text: chatInput, sender: 'user' };
        setChatMessages(prev => [...prev, newUserMessage]);
        setChatInput('');
        setIsBotTyping(true);

        setTimeout(() => {
            const botResponse: ChatMessage = { 
                id: Date.now() + 1, 
                text: "Olá! Sou o assistente virtual. Para um atendimento completo, por favor, entre em contato pelo nosso WhatsApp.",
                sender: 'bot' 
            };
            setChatMessages(prev => [...prev, botResponse]);
            setIsBotTyping(false);
        }, 1500);
    };

    // === RENDER LOGIC ===
    const filteredInvoices = (dashboardData?.faturas || []).filter(invoice => {
        if (invoiceStatusFilter === 'todas') return true;
        return invoice.status === invoiceStatusFilter;
    });

    const sortedAndFilteredInvoices = filteredInvoices.sort((a, b) => {
        const aIsFav = favoriteInvoices.has(String(a.id));
        const bIsFav = favoriteInvoices.has(String(b.id));
        if (aIsFav && !bIsFav) return -1;
        if (!aIsFav && bIsFav) return 1;
        return 0;
    });

    const getInvoiceStatusProps = (status: Invoice['status']) => {
        switch (status) {
            case 'pago': return { icon: CheckCircle, color: 'green', label: 'Pago' };
            case 'vencido': return { icon: AlertCircle, color: 'red', label: 'Vencido' };
            case 'cancelado': return { icon: Ban, color: 'gray', label: 'Cancelado' };
            default: return { icon: Clock, color: 'blue', label: 'Em Aberto' };
        }
    };

    const TABS = [
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'invoices', label: 'Faturas', icon: FileText },
      { id: 'consumption', label: 'Extrato', icon: BarChart3 },
      { id: 'contracts', label: 'Contratos', icon: FileSignature },
      { id: 'support', label: 'Suporte', icon: MessageSquare },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ];
    
    // === RENDER ===
    if (isLoading) {
        return <div className="min-h-screen bg-fiber-dark flex items-center justify-center"><Loader2 size={48} className="text-fiber-orange animate-spin" /></div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-fiber-dark flex items-center justify-center p-4 animate-fadeIn">
                <div className="w-full max-w-md bg-fiber-card p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white text-center mb-2">Área do Cliente</h2>
                    <p className="text-gray-400 text-center mb-8">Acesse sua conta para gerenciar seus serviços.</p>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="email" name="email" placeholder="Seu e-mail" required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type={showLoginPass ? 'text' : 'password'} name="password" placeholder="Sua senha" required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" />
                            <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fiber-card focus:ring-fiber-orange rounded-full p-1">
                                {showLoginPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                        {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
                        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                           {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Acessar'}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                       Problemas para acessar? <a href="#" onClick={(e) => { e.preventDefault(); alert('Por favor, entre em contato com o suporte via WhatsApp.'); }} className="text-fiber-orange hover:underline font-semibold">Fale com o suporte</a>.
                    </p>
                </div>
            </div>
        );
    }

    // Authenticated View
    return (
        <div className="min-h-screen bg-black pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Olá, {dashboardData?.cliente.nome.split(' ')[0]}!</h1>
                        <p className="text-gray-400">Bem-vindo(a) de volta à sua central de controle.</p>
                    </div>
                    <Button onClick={handleLogout} variant="secondary" className="!py-2 !px-4 text-sm gap-2">
                        <LogOut size={16} /> Sair
                    </Button>
                </header>

                {/* Main Layout: Sidebar + Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/4 lg:sticky top-24 self-start">
                        <div className="bg-fiber-card border border-white/10 rounded-2xl p-4 space-y-2">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors font-medium text-sm ${activeTab === tab.id ? 'bg-fiber-orange text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="w-full lg:w-3/4">
                        <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 md:p-8 min-h-[500px] animate-fadeIn">
                            {/* Render active tab content */}
                            
                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && dashboardData && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-8">Visão Geral</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Connection Status */}
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 mb-4 text-fiber-orange"><Wifi size={20} /> <h3 className="text-white font-bold">Status da Conexão</h3></div>
                                            <div className={`flex items-center gap-2 font-bold ${dashboardData.conexao.online ? 'text-fiber-green' : 'text-red-500'}`}>
                                                {dashboardData.conexao.online ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                {dashboardData.conexao.online ? 'Online' : 'Offline'}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-2">IP: <span className="font-mono">{dashboardData.conexao.ip}</span></div>
                                            <div className="text-sm text-gray-400">Uptime: {dashboardData.conexao.uptime}</div>
                                        </div>
                                        {/* Contract */}
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 mb-4 text-fiber-orange"><FileSignature size={20} /> <h3 className="text-white font-bold">Seu Plano</h3></div>
                                            <p className="text-xl font-semibold text-white">{dashboardData.contrato.plano}</p>
                                            <div className="text-sm text-gray-400 mt-2">Status: <span className="font-bold">{getStatusContrato(dashboardData.contrato.status)}</span></div>
                                            <div className="text-sm text-gray-400">Velocidade: {dashboardData.contrato.velocidade}</div>
                                        </div>
                                        {/* Consumption */}
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5 md:col-span-2">
                                            <div className="flex items-center gap-3 mb-4 text-fiber-orange"><BarChart3 size={20} /> <h3 className="text-white font-bold">Consumo (Mês Atual)</h3></div>
                                            <div className="flex flex-col sm:flex-row gap-8">
                                                <div className="flex items-center gap-3">
                                                    <ArrowDown className="text-fiber-blue" />
                                                    <div><span className="text-gray-400 text-sm">Download</span><p className="text-white font-bold text-lg">{formatBytes(dashboardData.consumo.total_download_bytes)}</p></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ArrowUp className="text-fiber-orange" />
                                                    <div><span className="text-gray-400 text-sm">Upload</span><p className="text-white font-bold text-lg">{formatBytes(dashboardData.consumo.total_upload_bytes)}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INVOICES TAB */}
                            {activeTab === 'invoices' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Minhas Faturas</h2>
                                    <div className="flex items-center gap-2 mb-6 bg-neutral-900 p-1.5 rounded-full border border-white/10 w-fit">
                                        {['aberto', 'pago', 'todas'].map(status => (
                                            <button key={status} onClick={() => setInvoiceStatusFilter(status)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${invoiceStatusFilter === status ? 'bg-fiber-orange text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        {sortedAndFilteredInvoices.length > 0 ? sortedAndFilteredInvoices.map(invoice => {
                                            const { icon: Icon, color, label } = getInvoiceStatusProps(invoice.status);
                                            const isFav = favoriteInvoices.has(String(invoice.id));
                                            return (
                                                <div key={invoice.id} className="bg-neutral-900 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 relative">
                                                    <button onClick={() => toggleFavorite(String(invoice.id))} className="text-gray-500 hover:text-yellow-400 absolute right-4 top-4 md:relative md:right-auto md:top-auto md:order-first md:mr-4">
                                                        <Star size={18} className={`transition-colors ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                                    </button>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon size={16} className={`text-fiber-${color}`} />
                                                            <span className={`text-sm font-bold text-fiber-${color}`}>{label}</span>
                                                            <span className="text-gray-500 text-xs">| Venc.: {invoice.vencimento}</span>
                                                        </div>
                                                        <p className="text-white font-semibold">R$ {invoice.valor}</p>
                                                        <p className="text-xs text-gray-400">{invoice.descricao || 'Referente ao serviço de internet'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {invoice.linha_digitavel && <Button onClick={() => handleCopy(invoice.linha_digitavel!, String(invoice.id))} variant="secondary" className="!text-xs !py-1.5 !px-3 gap-1.5"><Copy size={12} /> {copiedBarcodeId === String(invoice.id) ? 'Copiado!' : 'Código'}</Button>}
                                                        {invoice.pix_code && <Button onClick={() => handleOpenPixModal(invoice.pix_code!)} className="!bg-fiber-green/10 !text-fiber-green !text-xs !py-1.5 !px-3 gap-1.5"><QrCode size={12} /> Pagar PIX</Button>}
                                                        <Button onClick={() => handleDownloadBoleto(invoice.id)} variant="outline" className="!text-xs !py-1.5 !px-3 gap-1.5"><Download size={12} /> PDF</Button>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <p className="text-gray-500 text-center py-8">Nenhuma fatura encontrada com este status.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CONSUMPTION TAB */}
                            {activeTab === 'consumption' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Extrato de Conexão</h2>
                                    <p className="text-gray-400 text-sm">Acompanhe seu uso de dados ao longo do tempo.</p>
                                    <ConsumptionChart history={dashboardData?.consumo.history} />
                                </div>
                            )}

                            {/* CONTRACTS TAB */}
                            {activeTab === 'contracts' && (
                                 <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Meus Contratos</h2>
                                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center">
                                        <div>
                                            <h3 className="text-white font-bold">Contrato de Prestação de Serviço</h3>
                                            <p className="text-sm text-gray-400">Plano: {dashboardData?.contrato.plano}</p>
                                        </div>
                                        {dashboardData?.contratoPdf ? (
                                            <Button onClick={() => window.open(dashboardData.contratoPdf!, '_blank')} variant="primary" className="mt-4 sm:mt-0 gap-2">
                                                <DownloadCloud size={16} /> Baixar Contrato
                                            </Button>
                                        ) : (
                                            <p className="text-sm text-gray-500">Contrato digital indisponível.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SUPPORT TAB */}
                            {activeTab === 'support' && (
                                 <div className="flex flex-col h-[600px]">
                                    <h2 className="text-2xl font-bold text-white mb-4">Suporte via Chat</h2>
                                    <div className="bg-neutral-900 border border-white/10 rounded-xl flex-grow flex flex-col overflow-hidden">
                                        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                                            {chatMessages.map(msg => (
                                                <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    {msg.sender === 'bot' && <div className="w-8 h-8 bg-fiber-orange rounded-full flex items-center justify-center flex-shrink-0"><Bot size={18} /></div>}
                                                    <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-fiber-blue text-white rounded-br-none' : 'bg-neutral-800 text-gray-300 rounded-bl-none'}`}>
                                                        <p className="text-sm">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {isBotTyping && <div className="flex items-end gap-2 justify-start"><div className="w-8 h-8 bg-fiber-orange rounded-full flex items-center justify-center flex-shrink-0"><Bot size={18} /></div><div className="p-3 rounded-2xl bg-neutral-800"><Loader2 className="animate-spin text-gray-400" size={16}/></div></div>}
                                        </div>
                                        <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10 flex items-center gap-2 bg-black/20">
                                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Digite sua mensagem..." className="w-full bg-neutral-800 border border-white/10 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" />
                                            <Button type="submit" variant="primary" className="!p-3 rounded-full"><Send size={18} /></Button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Configurações da Conta</h2>
                                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Trocar Senha da Área do Cliente</h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                                            <div className="relative">
                                                <input type={showNewPass ? 'text' : 'password'} name="novaSenha" placeholder="Nova senha" required className="w-full bg-fiber-dark border border-white/10 rounded-lg p-3 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" />
                                                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">{showNewPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                                            </div>
                                            <Button type="submit" variant="primary">Alterar Senha</Button>
                                        </form>
                                        {passwordChangeStatus && (
                                            <div className={`mt-4 text-sm p-3 rounded-lg flex items-center gap-2 ${passwordChangeStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {passwordChangeStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                {passwordChangeStatus.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>

            {/* PIX Modal */}
            {isPixModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full relative">
                        <button onClick={() => setPixModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-bold text-white text-center mb-4">Pagamento via PIX</h3>
                        <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4">
                            {/* Placeholder for QR Code image */}
                             <div className="w-48 h-48 bg-neutral-800 flex items-center justify-center"><QrCode size={100} className="text-white"/></div>
                        </div>
                        <p className="text-center text-sm text-gray-400 mb-4">Use o Pix Copia e Cola para pagar.</p>
                        <Button onClick={handleCopyPix} fullWidth className="gap-2 !bg-fiber-green hover:!bg-green-600">
                            {isPixCopied ? <><CheckCircle size={16}/> Copiado!</> : <><Copy size={16}/> Copiar Código PIX</>}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientArea;