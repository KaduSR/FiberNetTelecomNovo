import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Shield, Eye, EyeOff, Mail, Wifi, Activity, 
  Router, Unlock, Clock, MapPin, Settings, KeyRound, Home, ArrowUp, ArrowDown, Globe, MessageSquare, Bot, Send, LayoutDashboard, Ban, ChevronRight, Star,
  FileSignature, BarChart3, ScrollText, DownloadCloud, Zap, Power, Server, Link2, HelpCircle
} from 'lucide-react';
import Button from './Button';
import { Invoice, ConsumptionHistory, ConsumptionPoint, DashboardData, Login } from '../types';

// === API Configuration ===
const API_BASE_URL = '/api'; // Uses the Vite proxy in development

// === HELPERS & TYPES ===
const formatBytes = (bytes: number | string | undefined, decimals = 2) => {
    const val = Number(bytes);
    if (isNaN(val) || val === 0) return '0 GB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(val) / Math.log(k));
    // Handle large values that might exceed 'TB'
    const sizeIndex = Math.min(i, sizes.length - 1);
    return `${parseFloat((val / Math.pow(k, sizeIndex)).toFixed(dm))} ${sizes[sizeIndex]}`;
};

const getStatusContrato = (status: string) => {
    const map: Record<string, { label: string, color: string }> = { 
      'A': { label: 'Ativo', color: 'text-fiber-green' }, 
      'S': { label: 'Suspenso', color: 'text-yellow-400' }, 
      'C': { label: 'Cancelado', color: 'text-red-500' } 
    };
    return map[String(status).toUpperCase()] || { label: 'Indefinido', color: 'text-gray-500' };
};


// === SUB-COMPONENT: CONSUMPTION CHART ===
const ConsumptionChart: React.FC<{ history?: ConsumptionHistory }> = ({ history }) => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
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
                    {(['daily', 'weekly', 'monthly', 'annual'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === p ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            {p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Anual' }
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
    const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showNewPass, setShowNewPass] = useState(false);
    const [actionStatus, setActionStatus] = useState<{ [key: string]: { status: 'loading' | 'success' | 'error', message?: string } }>({});
     const [diagResult, setDiagResult] = useState<{ download: string, upload: string } | null>(null);


    // === API FUNCTIONS ===
    
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao carregar dados do painel');
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error(error);
            handleLogout();
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
            if (!response.ok) throw new Error(data.error || 'Login falhou');
            
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
            if (!response.ok) throw new Error(data.error || 'Falha ao trocar senha');
            setPasswordChangeStatus({ type: 'success', message: data.message });
            e.currentTarget.reset();
        } catch (error: any) {
            setPasswordChangeStatus({ type: 'error', message: error.message });
        } finally {
            setTimeout(() => setPasswordChangeStatus(null), 5000);
        }
    };

    const performLoginAction = async (loginId: string | number, action: 'limpar-mac' | 'desconectar' | 'diagnostico') => {
        setActionStatus(prev => ({ ...prev, [loginId]: { status: 'loading' } }));
        setDiagResult(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/logins/${loginId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Falha ao executar ação`);

            if (action === 'diagnostico') {
                setDiagResult(data.consumo);
            }
            
            setActionStatus(prev => ({ ...prev, [loginId]: { status: 'success', message: data.message } }));
        } catch (error: any) {
            setActionStatus(prev => ({ ...prev, [loginId]: { status: 'error', message: error.message } }));
        } finally {
             setTimeout(() => setActionStatus(prev => ({ ...prev, [loginId]: { status: 'idle' as any } })), 3000);
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

    // === RENDER LOGIC ===
    const filteredInvoices = (dashboardData?.faturas || []).filter(invoice => {
        if (invoiceStatusFilter === 'todas') return true;
        return invoice.status === invoiceStatusFilter;
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
      { id: 'connections', label: 'Conexões', icon: Wifi },
      { id: 'consumption', label: 'Extrato', icon: BarChart3 },
      { id: 'contracts', label: 'Contratos', icon: FileSignature },
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
                     <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                        <p className="text-yellow-400 font-bold text-sm">Modo Desenvolvedor</p>
                        <p className="text-yellow-500 text-xs mt-1">
                            Use <strong className="font-mono">dev@fibernet.com</strong> / <strong className="font-mono">dev</strong> para testar.
                        </p>
                    </div>
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
                        <h1 className="text-3xl font-bold text-white">Olá, {dashboardData?.clientes[0]?.nome.split(' ')[0]}!</h1>
                        <p className="text-gray-400">Bem-vindo(a) à sua central de controle unificada.</p>
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
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors font-medium text-sm ${activeTab === tab.id ? 'bg-fiber-orange text-white shadow-md' : 'text-gray-300 hover:bg-white/5'}`}>
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="w-full lg:w-3/4">
                        <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 md:p-8 min-h-[500px] animate-fadeIn">
                           
                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && dashboardData && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-8">Visão Geral</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5 md:col-span-2">
                                            <div className="flex items-center gap-3 mb-4 text-fiber-orange"><User size={20} /> <h3 className="text-white font-bold">Clientes Vinculados ({dashboardData.clientes.length})</h3></div>
                                            {dashboardData.clientes.map(c => <p key={c.id} className="text-sm text-gray-400">{c.nome} - <span className="text-xs">{c.endereco}</span></p>)}
                                        </div>
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 mb-4 text-fiber-orange"><FileSignature size={20} /> <h3 className="text-white font-bold">Contratos Ativos</h3></div>
                                            <p className="text-3xl font-bold text-white">{dashboardData.contratos.filter(c => c.status === 'A').length}</p>
                                        </div>
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5">
                                             <div className="flex items-center gap-3 mb-4 text-fiber-orange"><Link2 size={20} /> <h3 className="text-white font-bold">Conexões</h3></div>
                                             <p className="text-3xl font-bold text-white">{dashboardData.logins.length}</p>
                                        </div>
                                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/5 md:col-span-2">
                                            <div className="flex items-center gap-3 mb-4 text-fiber-orange"><BarChart3 size={20} /> <h3 className="text-white font-bold">Consumo Total (Mês Atual)</h3></div>
                                            <div className="flex flex-col sm:flex-row gap-8">
                                                <div className="flex items-center gap-3"><ArrowDown className="text-fiber-blue" /><p><span className="text-gray-400 text-sm">Download</span><br/><span className="text-white font-bold text-lg">{formatBytes(dashboardData.consumo.total_download_bytes)}</span></p></div>
                                                <div className="flex items-center gap-3"><ArrowUp className="text-fiber-orange" /><p><span className="text-gray-400 text-sm">Upload</span><br/><span className="text-white font-bold text-lg">{formatBytes(dashboardData.consumo.total_upload_bytes)}</span></p></div>
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
                                        {filteredInvoices.length > 0 ? filteredInvoices.map(invoice => {
                                            const { icon: Icon, color, label } = getInvoiceStatusProps(invoice.status);
                                            return (
                                                <div key={invoice.id} className="bg-neutral-900 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon size={16} className={`text-fiber-${color}`} />
                                                            <span className={`text-sm font-bold text-fiber-${color}`}>{label}</span>
                                                            <span className="text-gray-500 text-xs">| Venc.: {invoice.vencimento}</span>
                                                        </div>
                                                        <p className="text-white font-semibold">R$ {invoice.valor}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {invoice.linha_digitavel && <Button onClick={() => handleCopy(invoice.linha_digitavel!, String(invoice.id))} variant="secondary" className="!text-xs !py-1.5 !px-3 gap-1.5"><Copy size={12} /> {copiedBarcodeId === String(invoice.id) ? 'Copiado!' : 'Código'}</Button>}
                                                        {invoice.pix_code && <Button onClick={() => handleOpenPixModal(invoice.pix_code!)} className="!bg-fiber-green/10 !text-fiber-green !text-xs !py-1.5 !px-3 gap-1.5"><QrCode size={12} /> Pagar PIX</Button>}
                                                        {invoice.link_pdf && <Button onClick={() => window.open(invoice.link_pdf!, '_blank')} variant="outline" className="!text-xs !py-1.5 !px-3 gap-1.5"><Download size={12} /> PDF</Button>}
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <p className="text-gray-500 text-center py-8">Nenhuma fatura encontrada com este status.</p>
                                        )}
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
                                                    <div className={`flex items-center gap-2 font-bold text-sm ${login.status === 'online' ? 'text-fiber-green' : 'text-gray-500'}`}>
                                                        <div className={`w-2.5 h-2.5 rounded-full ${login.status === 'online' ? 'bg-fiber-green animate-pulse' : 'bg-gray-500'}`}></div>
                                                        {login.status === 'online' ? 'Online' : 'Offline'}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                                                    <div className="flex items-center gap-2 text-gray-400"><Server size={14}/> <strong>ONT:</strong> <span className="text-white">{login.sinal_ont || 'N/A'}</span></div>
                                                    <div className="flex items-center gap-2 text-gray-400"><Clock size={14}/> <strong>Uptime:</strong> <span className="text-white">{login.uptime || 'N/A'}</span></div>
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

                            {/* CONSUMPTION TAB */}
                            {activeTab === 'consumption' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Extrato de Conexão</h2>
                                    <p className="text-gray-400 text-sm">Acompanhe seu uso de dados ao longo do tempo.</p>
                                    <ConsumptionChart history={dashboardData?.consumo.history} />
                                </div>
                            )}

                            {/* CONTRACTS TAB */}
                            {activeTab === 'contracts' && dashboardData && (
                                 <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Meus Contratos ({dashboardData.contratos.length})</h2>
                                    <div className="space-y-4">
                                        {dashboardData.contratos.map(contrato => {
                                            const status = getStatusContrato(contrato.status);
                                            return(
                                                <div key={contrato.id} className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center">
                                                    <div>
                                                        <h3 className="text-white font-bold">{contrato.plano}</h3>
                                                        <p className={`text-sm font-bold ${status.color}`}>{status.label}</p>
                                                    </div>
                                                    {contrato.pdf_link ? (
                                                        <Button onClick={() => window.open(contrato.pdf_link!, '_blank')} variant="primary" className="mt-4 sm:mt-0 gap-2 !text-xs !py-2 !px-4">
                                                            <DownloadCloud size={16} /> Baixar Contrato
                                                        </Button>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 mt-4 sm:mt-0">Contrato digital indisponível.</p>
                                                    )}
                                                </div>
                                            )
                                        })}
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
                                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mt-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Desbloqueio de Confiança</h3>
                                        <p className="text-sm text-gray-400 mb-4">Se sua conexão foi bloqueada por falta de pagamento, você pode solicitar um desbloqueio temporário de 24h.</p>
                                        <Button variant="outline">Solicitar Desbloqueio</Button>
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
