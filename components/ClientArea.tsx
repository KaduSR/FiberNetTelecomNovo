import React, { useState, useEffect } from 'react';
import { User, Lock, FileText, Download, Copy, CheckCircle, AlertCircle, Loader2, QrCode, X, LogOut, Shield, Eye, EyeOff, CreditCard } from 'lucide-react';
import Button from './Button';
import { Invoice } from '../types';

const ClientArea: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [login, setLogin] = useState(''); // Pode ser email, cpf ou cnpj
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data State
    const [invoices, setInvoices] = useState<Invoice[] | null>(null);
    const [clientName, setClientName] = useState('Cliente Fiber.Net');

    // UI State
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activePixCode, setActivePixCode] = useState<string | null>(null);
    const [isPixCopied, setIsPixCopied] = useState(false);

    // Load saved Login on mount
    useEffect(() => {
        const savedLogin = localStorage.getItem('fiber_client_login');
        const savedToken = localStorage.getItem('fiber_auth_token');
        
        if (savedLogin) {
            setLogin(savedLogin);
            setRememberMe(true);
        }

        // Opcional: Validar token existente ao carregar a página
        if (savedToken) {
            // Aqui você poderia implementar uma chamada para /api/v1/auth/validate
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!login || !password) {
            setError('Por favor, preencha o login e a senha.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Limpa o login: Se tiver @ assume email, senão remove não-números (CPF/CNPJ)
            const cleanLogin = login.includes('@') ? login : login.replace(/\D/g, '');

            // Conectando à nova rota de Backend IXC
            const response = await fetch('https://api.centralfiber.online/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    login: cleanLogin, 
                    senha: password 
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Credenciais inválidas ou erro no servidor.');
            }

            const data = await response.json();
            
            // Sucesso na autenticação
            if (data.token) {
                localStorage.setItem('fiber_auth_token', data.token);
            }
            
            // Adaptação caso a API retorne 'faturas' ou 'boletos'
            const faturasRecebidas = data.faturas || data.boletos || [];
            setInvoices(faturasRecebidas);
            setClientName(data.nome || 'Cliente Fiber.Net'); 
            
            if (rememberMe) {
                localStorage.setItem('fiber_client_login', login);
            } else {
                localStorage.removeItem('fiber_client_login');
            }

            setIsAuthenticated(true);

        } catch (err: any) {
            console.error('Login Error:', err);
            setError(err.message || 'Falha na autenticação. Verifique seus dados.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setInvoices(null);
        setError(null);
        setPassword('');
        localStorage.removeItem('fiber_auth_token');
        if (!rememberMe) {
            setLogin('');
        }
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

    // --- LOGIN VIEW ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-fiber-dark flex flex-col pt-24 pb-12">
                <div className="flex-grow flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-fiber-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        
                        {/* Login Header */}
                        <div className="bg-neutral-900 p-8 text-center border-b border-white/5">
                            <div className="inline-flex items-center justify-center p-4 bg-fiber-orange/10 rounded-full text-fiber-orange mb-4">
                                <User size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Central do Assinante</h1>
                            <p className="text-gray-400 mt-2 text-sm">Acesse suas faturas e contratos.</p>
                        </div>

                        {/* Login Form */}
                        <div className="p-8">
                            <form onSubmit={handleLogin} className="space-y-5">
                                
                                {/* Login Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Login</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                            <CreditCard size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            placeholder="CPF, CNPJ ou E-mail"
                                            className="w-full h-12 pl-11 pr-4 bg-fiber-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-600"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Senha da Central"
                                            className="w-full h-12 pl-11 pr-12 bg-fiber-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-600"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-fiber-orange transition-colors focus:outline-none"
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="h-4 w-4 text-fiber-orange focus:ring-fiber-orange border-gray-700 rounded bg-neutral-800 cursor-pointer accent-fiber-orange"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400 cursor-pointer select-none">
                                            Lembrar login
                                        </label>
                                    </div>
                                    <a 
                                        href="https://wa.me/552424581861?text=Olá,%20esqueci%20minha%20senha%20da%20Central%20do%20Assinante.%20Poderiam%20me%20ajudar?" 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-fiber-orange hover:underline"
                                    >
                                        Esqueceu a senha?
                                    </a>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fadeIn">
                                        <AlertCircle size={16} className="flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    fullWidth 
                                    disabled={loading}
                                    className="h-12 text-base mt-2"
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Entrar'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center border-t border-white/5 pt-6">
                                <p className="text-xs text-gray-500 mb-2">
                                    Ainda não tem acesso?
                                </p>
                                <button 
                                    onClick={() => window.open('https://wa.me/552424581861', '_blank')}
                                    className="text-sm text-fiber-orange font-bold hover:underline focus:outline-none"
                                >
                                    Solicitar cadastro
                                </button>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="bg-neutral-950 p-4 text-center border-t border-white/5">
                            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                                <Lock size={12} />
                                <span>Acesso Seguro | Integração IXC Soft</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- DASHBOARD VIEW ---
    return (
        <div className="min-h-screen bg-fiber-dark pt-24 pb-12">
            
            {/* Dashboard Header */}
            <div className="bg-fiber-card border-y border-white/5 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-3 rounded-full text-gray-300 border border-white/5">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Olá, {clientName}</h1>
                            <p className="text-sm text-fiber-orange flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Cliente Fiber.Net
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="text-sm py-2 px-4 border-white/20 text-gray-300 hover:bg-white/5">
                        <LogOut size={16} className="mr-2" /> Sair
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Sidebar / Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-fiber-orange" /> Meus Dados
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex justify-between text-sm text-gray-400 p-2 bg-white/5 rounded">
                                    <span>Usuário</span>
                                    <span className="text-white font-medium truncate ml-2">{login}</span>
                                </li>
                                <li className="flex justify-between text-sm text-gray-400 p-2 bg-white/5 rounded">
                                    <span>Situação</span>
                                    <span className="text-green-400 font-bold">Ativo</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-fiber-orange/20 to-fiber-card border border-fiber-orange/30 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-2">Upgrade de Plano</h3>
                            <p className="text-sm text-gray-400 mb-4">Quer mais velocidade? Fale com um consultor.</p>
                            <Button variant="primary" fullWidth onClick={() => window.open('https://wa.me/552424581861', '_blank')}>
                                Solicitar Upgrade
                            </Button>
                        </div>
                    </div>

                    {/* Main Content - Invoices */}
                    <div className="lg:col-span-2">
                        <div className="bg-fiber-card border border-white/10 rounded-xl p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="text-fiber-orange" /> Faturas em Aberto
                                </h2>
                                <span className="bg-neutral-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
                                    {invoices?.length || 0}
                                </span>
                            </div>

                            {(!invoices || invoices.length === 0) ? (
                                <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-dashed border-white/10">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h3 className="text-white font-bold text-lg">Tudo certo!</h3>
                                    <p className="text-gray-400">Você não possui faturas pendentes no momento.</p>
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
                                                            : 'bg-fiber-green/10 text-fiber-green'
                                                    }`}>
                                                        {invoice.status}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">{invoice.descricao || 'Fatura Mensal'}</span>
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
                                                {invoice.pix_code && (
                                                    <button 
                                                        onClick={() => openPixModal(invoice.pix_code!)}
                                                        className="flex items-center px-4 py-2 bg-fiber-green/10 hover:bg-fiber-green/20 text-fiber-green rounded-lg text-sm font-bold transition-colors border border-fiber-green/30"
                                                    >
                                                        <QrCode size={16} className="mr-2" />
                                                        PIX
                                                    </button>
                                                )}
                                                
                                                {invoice.linha_digitavel && (
                                                    <button 
                                                        onClick={() => copyToClipboard(invoice.linha_digitavel!, `bar-${idx}`)}
                                                        className="flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                                                        title="Copiar Código de Barras"
                                                    >
                                                        {copiedId === `bar-${idx}` ? <CheckCircle size={16} className="mr-2 text-fiber-green" /> : <Copy size={16} className="mr-2" />}
                                                        {copiedId === `bar-${idx}` ? 'Copiado' : 'Código'}
                                                    </button>
                                                )}
                                                
                                                {invoice.link_pdf ? (
                                                    <button 
                                                        onClick={() => window.open(invoice.link_pdf, '_blank')}
                                                        className="flex items-center px-4 py-2 bg-fiber-orange hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-900/20"
                                                    >
                                                        <Download size={16} className="mr-2" />
                                                        PDF
                                                    </button>
                                                ) : (
                                                    <button disabled className="flex items-center px-4 py-2 bg-neutral-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed opacity-50">
                                                        <Download size={16} className="mr-2" /> PDF
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple PIX Modal */}
            {activePixCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closePixModal}></div>
                    <div className="relative bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-float">
                        <button 
                            onClick={closePixModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center p-3 bg-fiber-green/10 rounded-full text-fiber-green mb-3">
                                <QrCode size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Pagamento via PIX</h3>
                            <p className="text-gray-400 text-sm mt-1">Copie o código abaixo e cole no seu aplicativo bancário.</p>
                        </div>

                        <div className="bg-neutral-900 p-3 rounded-lg border border-white/5 mb-6">
                            <p className="text-gray-500 text-xs break-all font-mono line-clamp-6">
                                {activePixCode}
                            </p>
                        </div>

                        <button 
                            onClick={copyPixCode}
                            className="w-full py-3 px-4 bg-fiber-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center"
                        >
                            {isPixCopied ? <CheckCircle size={20} className="mr-2" /> : <Copy size={20} className="mr-2" />}
                            {isPixCopied ? 'Código PIX Copiado!' : 'Copiar Chave PIX'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientArea;