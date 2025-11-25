import React, { useState, useEffect } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Wifi, Activity, 
  Clock, Settings, Eye, EyeOff, Mail, ArrowUp, ArrowDown, LayoutDashboard, Ban,
  FileSignature, BarChart3, ScrollText, Zap, Power, Server, Link2, ThumbsUp, Printer, Trash2, ArrowLeft, MessageCircle
} from 'lucide-react';
import Button from './Button';
import { DashboardResponse, Consumo, Fatura } from '../types/api';
import { apiService } from '../services/apiService';
import { CONTACT_INFO } from '../constants';

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
const ConsumptionChart: React.FC<{ history?: Consumo['history'] }> = ({ history }) => {
    const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
    const [activePoint, setActivePoint] = useState<{ label: string, download: number, upload: number } | null>(null);

    // Map API data to Chart friendly format
    const rawData = history?.[period] || [];
    
    const data = rawData.map(item => ({
        label: period === 'daily' ? (item.data || '') : (item.mes_ano || ''),
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
                    <button onClick={() => setPeriod('daily')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === 'daily' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        Diário
                    </button>
                    <button onClick={() => setPeriod('monthly')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${period === 'monthly' ? 'bg-fiber-orange text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        Mensal
                    </button>
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
                    {/* Only show first and last label to avoid clutter */}
                    <span>{data[0]?.label}</span>
                    <span>{data[Math.floor(data.length / 2)]?.label}</span>
                    <span>{data[data.length - 1]?.label}</span>
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
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
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

    // Login View States
    const [loginView, setLoginView] = useState<'login' | 'forgot'>('login');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    
    const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [recoveryMessage, setRecoveryMessage] = useState('');

    // === API FUNCTIONS ===

    const fetchDashboardData = async () => {
        try {
            const data = await apiService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            handleLogout();
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');
        
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        // Use state value for email to guarantee we use what the user sees
        const email = emailInput;

        try {
            console.log("Conectando...");
            const loginResponse = await apiService.login({ email, password });
            
            if (!loginResponse.token) {
                 throw new Error('Erro crítico: Token de acesso não fornecido pelo servidor.');
            }

            // Validar Token Imediatamente
            console.log("Token recebido, validando sessão...");
            // Usamos apiService.getDashboard diretamente para poder capturar o erro aqui
            // ao invés de usar a função wrapper fetchDashboardData que faria logout
            const dashData = await apiService.getDashboard();
            setDashboardData(dashData);

            // Se chegou aqui, o login E o dashboard funcionaram
            if (rememberMe) {
                localStorage.setItem('fiber_saved_email', email);
            } else {
                localStorage.removeItem('fiber_saved_email');
            }

            setIsAuthenticated(true);
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error: any) {
            console.error("Login Error:", error);
            
            let msg = error.message || 'Ocorreu um erro ao tentar fazer login.';
            const lowerMsg = msg.toLowerCase();

            // Mensagens amigáveis para erros comuns
            if (
                lowerMsg.includes('fetch') || 
                lowerMsg.includes('network') || 
                lowerMsg.includes('connect') ||
                lowerMsg.includes('conexão') ||
                !window.navigator.onLine
            ) {
                msg = 'Sistema Indisponível: Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente mais tarde.';
            } else if (lowerMsg.includes('token') || lowerMsg.includes('json')) {
                msg = 'Erro de Sessão: O servidor retornou uma resposta inválida. Contate o suporte.';
            } else if (lowerMsg.includes('401') || lowerMsg.includes('403')) {
                msg = 'Credenciais inválidas. Verifique seu e-mail e senha.';
            }

            setLoginError(msg);
            localStorage.removeItem('authToken'); // Garante que não sobrou lixo
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRecoveryStatus('loading');
        setRecoveryMessage('');
        const formData = new FormData(e.currentTarget);
        const email = formData.get('recoveryEmail') as string;

        try {
            const data = await apiService.recoverPassword(email);
            setRecoveryStatus('success');
            setRecoveryMessage(data.message || 'Um link de redefinição foi enviado para seu e-mail.');
        } catch (error: any) {
            setRecoveryStatus('error');
            setRecoveryMessage(error.message || 'Falha ao solicitar recuperação.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setDashboardData(null);
        setLoginView('login');
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
        } finally {
            setTimeout(() => setPasswordChangeStatus(null), 5000);
        }
    };

    const performLoginAction = async (loginId: string | number, action: 'limpar-mac' | 'desconectar' | 'diagnostico') => {
        const id = Number(loginId);
        setActionStatus(prev => ({ ...prev, [loginId]: { status: 'loading' as const } }));
        setDiagResult(null);

        try {
            const data = await apiService.performLoginAction(id, action);
            
            if (action === 'diagnostico' && data.consumo) {
                setDiagResult(data.consumo);
            }

            setActionStatus(prev => ({ 
                ...prev, 
                [loginId]: { status: 'success' as const, message: data.message } 
            }));
        } catch (error: any) {
            setActionStatus(prev => ({ 
                ...prev, 
                [loginId]: { status: 'error' as const, message: error.message } 
            }));
        } finally {
             setTimeout(() => setActionStatus(prev => ({ ...prev, [loginId]: { status: 'idle' as const } })), 3000);
        }
    };

    // === EFFECTS ===
    useEffect(() => {
        const saved = localStorage.getItem('fiber_saved_email');
        if (saved) {
            setEmailInput(saved);
            setRememberMe(true);
        }

        const token = localStorage.getItem('authToken');
        if (token) {
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
        // Mapeamento simples de status
        const statusMap: Record<string, string> = { 'A': 'aberto', 'B': 'pago', 'C': 'cancelado' };
        return statusMap[invoice.status]?.toLowerCase() === invoiceStatusFilter;
    });

    const getInvoiceStatusProps = (status: Fatura['status']) => {
        switch (status) {
            case 'B': return { icon: CheckCircle, color: 'green', label: 'Pago' };
            case 'C': return { icon: Ban, color: 'gray', label: 'Cancelado' };
            default: return { icon: Clock, color: 'blue', label: 'Em Aberto' };
        }
    };

    const TABS = [
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'invoices', label: 'Faturas', icon: FileText },
      { id: 'connections', label: 'Conexões', icon: Wifi },
      { id: 'consumption', label: 'Extrato', icon: BarChart3 },
      { id: 'contracts', label: 'Contratos', icon: FileSignature },
      { id: 'notes', label: 'Notas Fiscais', icon: ScrollText },
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
                    
                    {loginView === 'login' ? (
                        <>
                            <h2 className="text-3xl font-bold text-white text-center mb-2">Área do Cliente</h2>
                            <p className="text-gray-400 text-center mb-8">Acesse sua conta para gerenciar seus serviços.</p>
                            <form onSubmit={handleLogin} className="space-y-6">
                                {loginError && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 animate-fadeIn">
                                        <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-sm">{loginError}</p>
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="Seu e-mail" 
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        required 
                                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" 
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type={showLoginPass ? 'text' : 'password'} name="password" placeholder="Sua senha" required className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" />
                                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fiber-card focus:ring-fiber-orange rounded-full p-1">
                                        {showLoginPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="form-checkbox h-4 w-4 text-fiber-orange rounded border-gray-600 bg-neutral-900 focus:ring-fiber-orange" 
                                        />
                                        Salvar login
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setLoginView('forgot');
                                            setLoginError('');
                                        }}
                                        className="text-fiber-orange hover:underline"
                                    >
                                        Esqueci a senha
                                    </button>
                                </div>
                                
                                <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Acessar'}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => {
                                    setLoginView('login');
                                    setRecoveryStatus('idle');
                                }} 
                                className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
                            >
                                <ArrowLeft size={16} /> Voltar para o Login
                            </button>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">Recuperar Senha</h2>
                            <p className="text-gray-400 text-center mb-8 text-sm">Digite seu e-mail cadastrado para redefinir sua senha.</p>
                            
                            {recoveryStatus !== 'success' ? (
                                <form onSubmit={handleRecovery} className="space-y-6">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input 
                                            type="email" 
                                            name="recoveryEmail" 
                                            placeholder="E-mail do cadastro" 
                                            required 
                                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 pl-12 text-white focus:outline-none focus:ring-1 focus:ring-fiber-orange" 
                                        />
                                    </div>

                                    {recoveryStatus === 'error' && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-3 animate-fadeIn">
                                            <p className="text-red-400 text-sm flex items-center justify-center gap-2">
                                                <AlertCircle size={16} /> {recoveryMessage}
                                            </p>
                                            <Button 
                                                type="button"
                                                variant="whatsapp" 
                                                fullWidth 
                                                onClick={() => window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=Olá, não consigo recuperar minha senha da área do cliente.`, '_blank')}
                                                className="!text-sm !py-2"
                                            >
                                                <MessageCircle size={16} className="mr-2" /> Falar no WhatsApp
                                            </Button>
                                        </div>
                                    )}

                                    <Button type="submit" variant="primary" fullWidth disabled={recoveryStatus === 'loading'}>
                                        {recoveryStatus === 'loading' ? <Loader2 className="animate-spin mx-auto" /> : 'Enviar Instruções'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center space-y-4 animate-fadeIn">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Verifique seu e-mail</h3>
                                    <p className="text-gray-400 text-sm">{recoveryMessage}</p>
                                    <Button 
                                        variant="outline" 
                                        fullWidth 
                                        onClick={() => setLoginView('login')}
                                        className="mt-4"
                                    >
                                        Voltar ao Login
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
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
                        <h1 className="text-3xl font-bold text-white">Olá, {dashboardData?.clientes[0]?.razao.split(' ')[0]}!</h1>
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
                                            {dashboardData.clientes.map(c => <p key={c.id} className="text-sm text-gray-400">{c.razao} - <span className="text-xs">{c.endereco}</span></p>)}
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
                                                            <span className="text-gray-500 text-xs">| Venc.: {invoice.data_vencimento}</span>
                                                        </div>
                                                        <p className="text-white font-semibold">R$ {invoice.valor}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {invoice.linha_digitavel && <Button onClick={() => handleCopy(invoice.linha_digitavel!, String(invoice.id))} variant="secondary" className="!text-xs !py-1.5 !px-3 gap-1.5"><Copy size={12} /> {copiedBarcodeId === String(invoice.id) ? 'Copiado!' : 'Código'}</Button>}
                                                        {invoice.pix_txid && <Button onClick={() => handleOpenPixModal(invoice.pix_txid!)} className="!bg-fiber-green/10 !text-fiber-green !text-xs !py-1.5 !px-3 gap-1.5"><QrCode size={12} /> Pagar PIX</Button>}
                                                        {invoice.boleto && <Button onClick={() => window.open(invoice.boleto!, '_blank')} variant="outline" className="!text-xs !py-1.5 !px-3 gap-1.5"><Download size={12} /> PDF</Button>}
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
                                                    <div className={`flex items-center gap-2 font-bold text-sm ${login.online === 'S' ? 'text-fiber-green' : 'text-gray-500'}`}>
                                                        <div className={`w-2.5 h-2.5 rounded-full ${login.online === 'S' ? 'bg-fiber-green animate-pulse' : 'bg-gray-500'}`}></div>
                                                        {login.online === 'S' ? 'Online' : 'Offline'}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                                                    <div className="flex items-center gap-2 text-gray-400"><Server size={14}/> <strong>ONT:</strong> <span className="text-white">{login.sinal_ultimo_atendimento || 'N/A'}</span></div>
                                                    <div className="flex items-center gap-2 text-gray-400"><Clock size={14}/> <strong>Uptime:</strong> <span className="text-white">{login.tempo_conectado || 'N/A'}</span></div>
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