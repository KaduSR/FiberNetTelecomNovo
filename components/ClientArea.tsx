import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, 
  QrCode, X, LogOut, Shield, Eye, EyeOff, Mail, Wifi, Activity, 
  Router, Unlock, Clock, MapPin, Settings, KeyRound, Home, ArrowUp, ArrowDown, Globe, MessageSquare, Bot, Send
} from 'lucide-react';
import Button from './Button';
import { Invoice } from '../types';

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

const getStatusFatura = (status: string, vencimento: string) => {
    const s = String(status).toUpperCase();
    if (['P', 'R', 'PAGO'].includes(s)) return 'pago';
    if (['C', 'CANCELADO'].includes(s)) return 'cancelado';
    
    if (vencimento) {
        const [day, month, year] = vencimento.split('/').map(Number);
        if (year > 2000) {
            const dueDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dueDate < today) return 'vencido';
        }
    }
    return 'aberto';
};

const getStatusContrato = (status: string) => {
    const map: Record<string, string> = { 'A': 'Ativo', 'S': 'Suspenso', 'C': 'Cancelado' };
    return map[String(status).toUpperCase()] || 'Indefinido';
};

interface ConnectionData {
    status: 'online' | 'offline';
    ip: string;
    uptime: string;
    download_usage: string;
    upload_usage: string;
}

interface ContractData {
    plan_name: string;
    speed_label: string;
    address: string;
    status: string;
}

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const API_BASE_URL = 'https://api.centralfiber.online/api/v1'; // Conforme arquivos do backend

// === MAIN COMPONENT ===
const ClientArea: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true); // Start loading to check token
    const [error, setError] = useState<string | null>(null);

    // Data State
    const [clientName, setClientName] = useState('Cliente');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [connection, setConnection] = useState<ConnectionData | null>(null);
    const [contract, setContract] = useState<ContractData | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'support' | 'settings'>('dashboard');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activePixCode, setActivePixCode] = useState<string | null>(null);
    const [unlocking, setUnlocking] = useState(false);
    const [unlockedSuccess, setUnlockedSuccess] = useState(false);

    // Change Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);


    // === EFFECTS ===
    useEffect(() => {
        const token = localStorage.getItem('fiber_auth_token');
        if (token) {
            fetchDashboardData(token);
        } else {
            setLoading(false);
        }
        const savedLogin = localStorage.getItem('fiber_client_login');
        if(savedLogin) setLogin(savedLogin);
    }, []);
    
    useEffect(() => {
        if (activeTab === 'support' && messages.length === 0) {
            setMessages([{ id: 1, sender: 'bot', text: `Olá! Sou o assistente virtual da Fiber.Net. Como posso te ajudar hoje? (Ex: 2ª via, desbloqueio)` }]);
        }
    }, [activeTab]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isBotTyping]);


    // === DATA FETCHING ===
    const fetchDashboardData = async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/dados`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                handleLogout();
                throw new Error("Sessão expirada. Faça login novamente.");
            }
            if (!response.ok) throw new Error("Não foi possível carregar os dados. Tente novamente.");

            const data = await response.json();
            
            // Map Client Data
            setClientName(data.cliente?.nome || 'Cliente');

            // Map Contract Data
            setContract({
                plan_name: data.contrato?.plano || 'Plano não informado',
                speed_label: `${data.contrato?.velocidade || '--'} Mbps`,
                address: data.cliente?.endereco || 'Endereço não informado',
                status: getStatusContrato(data.contrato?.status),
            });
            
            // Map Connection Data
            setConnection({
                status: (data.conexao?.online === true || String(data.conexao?.online).toLowerCase() === 's') ? 'online' : 'offline',
                ip: data.conexao?.ip || 'N/A',
                uptime: data.conexao?.uptime || '--',
                download_usage: formatBytes(data.consumo?.total_download_bytes || 0),
                upload_usage: formatBytes(data.consumo?.total_upload_bytes || 0),
            });

            // Map Invoices
            const faturas = (data.faturas || []).map((f: any) => ({
                id: f.id,
                vencimento: new Date(f.vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                valor: `R$ ${parseFloat(f.valor || 0).toFixed(2).replace('.', ',')}`,
                status: getStatusFatura(f.status, new Date(f.vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })),
                linha_digitavel: f.linha_digitavel,
                pix_code: f.pix_code || f.linha_digitavel,
                link_pdf: f.link_pdf,
            }));
            setInvoices(faturas);
            
            setIsAuthenticated(true);
        } catch (err: any) {
            setError(err.message);
            if(err.message.includes("Sessão expirada")) handleLogout(false);
        } finally {
            setLoading(false);
        }
    };


    // === ACTIONS ===
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, senha: password }),
            });
            if (!response.ok) throw new Error('Credenciais inválidas.');

            const data = await response.json();
            localStorage.setItem('fiber_auth_token', data.token);
            localStorage.setItem('fiber_client_login', login);
            await fetchDashboardData(data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleLogout = (clearLogin = true) => {
        setIsAuthenticated(false);
        localStorage.removeItem('fiber_auth_token');
        if(clearLogin) localStorage.removeItem('fiber_client_login');
        setPassword('');
    };

    const handleUnlockTrust = () => {
        setUnlocking(true);
        setTimeout(() => {
            setUnlocking(false);
            setUnlockedSuccess(true);
        }, 2000);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage(null);
        try {
            const token = localStorage.getItem('fiber_auth_token');
            const res = await fetch(`${API_BASE_URL}/dashboard/trocar-senha`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ senhaAtual: currentPassword, novaSenha: newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro desconhecido.");

            setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setCurrentPassword('');
            setNewPassword('');
            setTimeout(() => setIsChangePasswordOpen(false), 2000);
        } catch (err: any) {
            setPasswordMessage({ type: 'error', text: err.message });
        } finally {
            setPasswordLoading(false);
        }
    };
    
    const sendChatMessage = (text: string) => {
        if (!text.trim() || isBotTyping) return;
        
        const userMsg: ChatMessage = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsBotTyping(true);

        // Simulação de resposta do Bot
        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let botText = "Não entendi sua solicitação. Você pode pedir ajuda sobre '2ª via', 'desbloqueio' ou 'suporte técnico'.";
            if(lowerText.includes('fatura') || lowerText.includes('2ª via')) {
                const openInvoice = invoices.find(i => i.status === 'aberto' || i.status === 'vencido');
                botText = openInvoice ? `Encontrei uma fatura com vencimento em ${openInvoice.vencimento}. Use o menu "Faturas" para pagar.` : "Ótima notícia! Você não possui faturas em aberto.";
            } else if (lowerText.includes('desbloqueio')) {
                botText = "Para solicitar o desbloqueio, vá para a 'Visão Geral' e use o botão 'Liberar Internet Agora' se estiver disponível.";
            } else if (lowerText.includes('internet') || lowerText.includes('suporte')) {
                botText = "Se estiver sem conexão, tente reiniciar seu roteador da tomada por 1 minuto. Se não resolver, entre em contato via WhatsApp no nosso site.";
            }
            const botMsg: ChatMessage = { id: Date.now() + 1, text: botText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            setIsBotTyping(false);
        }, 1500);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // === RENDER LOGIC ===
    if (loading && !isAuthenticated) {
        return <div className="min-h-screen bg-fiber-dark flex items-center justify-center"><Loader2 className="animate-spin text-fiber-orange" size={48} /></div>;
    }

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
                                {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={16} />{error}</div>}
                                <Button type="submit" variant="primary" fullWidth disabled={loading} className="h-12 text-base mt-2">
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar na Central'}
                                </Button>
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
            <header className="bg-fiber-card border-y border-white/5 mb-8 sticky top-16 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-4">
                             <div className="bg-neutral-800 p-3 rounded-full text-gray-300 border border-white/5">
                                <User size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white truncate max-w-[200px] sm:max-w-xs">Olá, {clientName}</h1>
                                <p className="text-sm text-fiber-orange flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${connection?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {connection?.status === 'online' ? 'Conectado' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => handleLogout()} className="!py-2 !px-4 !text-xs border-white/20 text-gray-300 hover:bg-white/5">
                            <LogOut size={14} className="mr-2" /> Sair
                        </Button>
                    </div>
                    <nav className="flex gap-1 sm:gap-6 overflow-x-auto no-scrollbar border-t border-white/5 pt-2">
                        {[
                            { id: 'dashboard', label: 'Visão Geral', icon: Home },
                            { id: 'invoices', label: 'Faturas', icon: FileText },
                            { id: 'support', label: 'Suporte', icon: MessageSquare },
                            { id: 'settings', label: 'Configurações', icon: Settings },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap px-2 sm:px-0 ${activeTab === tab.id ? 'text-fiber-orange border-fiber-orange' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                        <div className="lg:col-span-2 space-y-8">
                            {hasOverdue && !unlockedSuccess && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 animate-pulse">
                                    <div className="flex items-center gap-3 mb-3 text-red-400"><Unlock size={24} /><h3 className="font-bold">Aviso Importante</h3></div>
                                    <p className="text-sm text-gray-300 mb-4">Detectamos faturas vencidas. Se sua conexão foi bloqueada, use o desbloqueio de confiança para liberá-la por 48 horas.</p>
                                    <Button onClick={handleUnlockTrust} disabled={unlocking} variant='primary' className='bg-red-600 hover:bg-red-700'>
                                        {unlocking ? <Loader2 className="animate-spin" /> : <Unlock size={16} />}
                                        {unlocking ? 'Liberando...' : 'Liberar Internet Agora'}
                                    </Button>
                                </div>
                            )}
                            {unlockedSuccess && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"><div className="flex items-center gap-2 text-green-400 font-bold mb-2"><CheckCircle size={20} /> Desbloqueio Solicitado!</div><p className="text-sm text-gray-300">Sua conexão deve ser restabelecida em até 5 minutos. Reinicie seu roteador.</p></div>
                            )}
                            <div className="bg-fiber-card border border-white/10 rounded-xl p-6"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-fiber-orange" />Próxima Fatura</h3>
                                {invoices.find(i => i.status === 'aberto' || i.status === 'vencido') ? 
                                    invoices.filter(i => i.status === 'aberto' || i.status === 'vencido').slice(0, 1).map(invoice => (
                                    <div key={invoice.id} className="bg-neutral-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4"><div className="text-center sm:text-left"><span className={`text-xs font-bold uppercase px-2 py-1 rounded ${invoice.status === 'vencido' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{invoice.status}</span><p className="text-white text-2xl font-bold mt-1">{invoice.valor}</p><p className="text-gray-400 text-sm">Vencimento: {invoice.vencimento}</p></div><Button onClick={() => setActiveTab('invoices')}>Ver Detalhes</Button></div>
                                )) : <div className="text-center py-8 text-gray-400"><CheckCircle className="mx-auto text-green-500 mb-2" />Tudo em dia!</div>}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-fiber-card border border-white/10 rounded-xl p-6"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-fiber-orange" />Status da Rede</h3><div className="space-y-3 text-sm"><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400">IP Público</span><span className="text-white font-mono text-xs">{connection?.ip}</span></div><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400">Uptime</span><span className="text-white font-mono">{connection?.uptime}</span></div><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400 flex items-center gap-1.5"><ArrowDown size={14} className='text-cyan-400'/>Download</span><span className="text-white font-mono">{connection?.download_usage}</span></div><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400 flex items-center gap-1.5"><ArrowUp size={14} className='text-orange-400'/>Upload</span><span className="text-white font-mono">{connection?.upload_usage}</span></div></div></div>
                            <div className="bg-fiber-card border border-white/10 rounded-xl p-6"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><Router size={18} className="text-fiber-orange" />Meu Plano</h3><div className="space-y-3 text-sm"><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400">Plano</span><span className="text-white font-bold">{contract?.plan_name}</span></div><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400">Velocidade</span><span className="text-white font-bold">{contract?.speed_label}</span></div><div className="flex justify-between items-center bg-neutral-900/50 p-2 rounded"><span className="text-gray-400">Status</span><span className={`font-bold ${contract?.status === 'Ativo' ? 'text-green-400' : 'text-red-400'}`}>{contract?.status}</span></div></div></div>
                        </div>
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="bg-fiber-card border border-white/10 rounded-xl p-6 animate-fadeIn"><h2 className="text-xl font-bold text-white mb-6">Minhas Faturas</h2><div className="space-y-4">
                        {invoices.length > 0 ? invoices.map((invoice, idx) => (
                            <div key={idx} className="bg-fiber-dark border border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex-1"><div className="flex items-center gap-4 mb-2"><span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${{'pago': 'bg-green-500/10 text-green-400', 'vencido': 'bg-red-500/10 text-red-400', 'aberto': 'bg-blue-500/10 text-blue-400', 'cancelado': 'bg-gray-500/10 text-gray-400'}[invoice.status] || ''}`}>{invoice.status}</span><span className="text-gray-500 text-sm">Vencimento: {invoice.vencimento}</span></div><p className="text-white font-bold text-lg">{invoice.valor}</p></div>
                                <div className="flex flex-wrap gap-2">{invoice.status !== 'pago' && invoice.pix_code && (<button onClick={() => { setActivePixCode(invoice.pix_code!)}} className="flex items-center px-3 py-2 bg-fiber-green/10 text-fiber-green rounded-lg text-sm font-bold border border-fiber-green/20 hover:bg-fiber-green/20"><QrCode size={16} className="mr-2"/>PIX</button>)}{invoice.status !== 'pago' && invoice.linha_digitavel && (<button onClick={() => copyToClipboard(invoice.linha_digitavel!, `bar-${idx}`)} className="flex items-center px-3 py-2 bg-neutral-800 text-white rounded-lg text-sm border border-white/10 hover:bg-neutral-700">{copiedId === `bar-${idx}` ? <CheckCircle size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}{copiedId === `bar-${idx}` ? 'Copiado!' : 'Código'}</button>)}{invoice.link_pdf && (<Button variant="outline" className="!py-2 !px-3 !text-sm" onClick={() => window.open(invoice.link_pdf, '_blank')}><Download size={16} className="mr-2"/>PDF</Button>)}</div>
                            </div>
                        )) : <div className="text-center py-10 text-gray-500">Nenhuma fatura encontrada.</div>}
                    </div></div>
                )}
                
                {activeTab === 'support' && (
                     <div className="bg-fiber-card border border-white/10 rounded-xl h-[calc(100vh-250px)] min-h-[500px] flex flex-col animate-fadeIn">
                        <div className="p-4 border-b border-white/5 flex items-center gap-3"><div className="bg-fiber-orange/10 p-2 rounded-full"><Bot className="text-fiber-orange" /></div><div><h3 className="text-white font-bold">Assistente Virtual</h3><p className="text-xs text-green-400">Online</p></div></div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-900/30">
                            {messages.map(msg => (<div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-fiber-orange text-white rounded-br-none' : 'bg-neutral-800 text-gray-200 rounded-bl-none'}`}>{msg.text}</div></div>))}
                            {isBotTyping && (<div className="flex justify-start"><div className="bg-neutral-800 p-3 rounded-2xl rounded-bl-none flex gap-1.5"><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span><span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span></div></div>)}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-white/5"><div className="relative"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage(chatInput)} placeholder="Digite sua mensagem..." className="w-full bg-neutral-900 border border-white/10 rounded-full pl-4 pr-12 py-3 text-white text-sm focus:border-fiber-orange" /><button onClick={() => sendChatMessage(chatInput)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-fiber-orange rounded-full text-white"><Send size={16} /></button></div></div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-fiber-card border border-white/10 rounded-xl p-6 animate-fadeIn"><h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-fiber-orange" />Configurações</h2><div className="max-w-md space-y-6">
                        <div className="bg-neutral-900/50 rounded-lg p-4 border border-white/5"><div className="flex justify-between items-center"><div className="flex items-center gap-3"><KeyRound size={20} className="text-gray-400"/><h4 className="font-bold text-white">Alterar Senha</h4></div><Button variant="secondary" className="!text-xs !py-1 !px-3" onClick={()=> setIsChangePasswordOpen(!isChangePasswordOpen)}>{isChangePasswordOpen ? 'Fechar' : 'Alterar'}</Button></div>
                            {isChangePasswordOpen && (<form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-white/10 space-y-3"><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Senha Atual" className="w-full bg-fiber-dark border border-white/10 rounded px-3 py-2 text-white" required /><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova Senha" className="w-full bg-fiber-dark border border-white/10 rounded px-3 py-2 text-white" required /><Button type="submit" disabled={passwordLoading}>{passwordLoading ? <Loader2 className='animate-spin'/> : 'Salvar Nova Senha'}</Button>
                            {passwordMessage && <p className={`text-sm mt-2 ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{passwordMessage.text}</p>}
                            </form>)}
                        </div>
                        <div className="bg-neutral-900/50 rounded-lg p-4 border border-white/5"><h4 className="font-bold text-white mb-2">Seus Dados</h4><div className="text-sm space-y-2"><div className="flex justify-between"><span className="text-gray-400">Endereço</span><span className="text-white text-right truncate ml-4">{contract?.address}</span></div></div></div>
                    </div></div>
                )}
            </main>

            {/* PIX MODAL */}
            {activePixCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={() => setActivePixCode(null)}><div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div><div className="relative bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}><button onClick={() => setActivePixCode(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button><div className="text-center mb-6"><div className="inline-flex p-3 bg-fiber-green/10 rounded-full text-fiber-green mb-3"><QrCode size={32} /></div><h3 className="text-xl font-bold text-white">Pagamento via PIX</h3><p className="text-gray-400 text-sm mt-1">Copie o código e cole no seu app bancário.</p></div><div className="bg-neutral-900 p-3 rounded-lg border border-white/5 mb-6"><p className="text-gray-400 text-xs break-all font-mono line-clamp-4">{activePixCode}</p></div><Button onClick={() => copyToClipboard(activePixCode, 'pix-modal')} fullWidth variant='whatsapp'>{copiedId === 'pix-modal' ? <><CheckCircle size={20} className='mr-2'/>Copiado!</> : <><Copy size={20} className='mr-2'/>Copiar Código PIX</>}</Button></div></div>
            )}
        </div>
    );
};

export default ClientArea;
