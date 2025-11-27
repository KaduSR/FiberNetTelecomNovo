
import React, { useState } from 'react';
import { Search, FileText, Download, Copy, CheckCircle, AlertCircle, CreditCard, Loader2, QrCode, X } from 'lucide-react';
import Button from './Button';
import { apiService } from '../src/services/apiService';
import { BoletoSearchResponse, BoletoSearchItem } from '../src/types/api';

const InvoiceFetcher: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BoletoSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // States for Pix Modal
  const [activePixCode, setActivePixCode] = useState<string | null>(null);
  const [isPixCopied, setIsPixCopied] = useState(false);

  // Format CPF (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(value);
  };

  const fetchInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      setError('Por favor, digite um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.searchInvoicesByCpf(cleanCpf);
      
      if (!data.success || data.resumo.totalBoletos === 0) {
        setError('Nenhuma fatura em aberto encontrada para este CPF.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Não foi possível localizar faturas para este CPF. Verifique o número ou entre em contato com o suporte.');
    } finally {
      setLoading(false);
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

  return (
    <section id="segunda-via" className="py-20 bg-fiber-card border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-orange/10 rounded-full text-fiber-orange mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">2ª Via de Boleto</h2>
          <p className="text-gray-400">Digite seu CPF para acessar suas faturas em aberto de forma rápida e segura.</p>
        </div>

        <div className="bg-neutral-900 p-6 md:p-10 rounded-2xl border border-white/10 shadow-xl">
          <form onSubmit={fetchInvoices} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-grow relative">
               <input
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="Digite seu CPF (apenas números)"
                className="w-full h-14 pl-5 pr-4 bg-fiber-dark border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-600"
                maxLength={14}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                 <CreditCard size={20} />
              </div>
            </div>
            <Button 
                type="submit" 
                variant="primary" 
                className="h-14 md:w-48 text-lg" 
                disabled={loading || cpf.length < 14}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Buscar Faturas'}
            </Button>
          </form>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center text-red-400 animate-fadeIn">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-gray-500 uppercase">Total Boletos</p>
                    <p className="text-lg font-bold text-white">{result.resumo.totalBoletos}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-gray-500 uppercase">A Pagar</p>
                    <p className="text-lg font-bold text-white">{result.resumo.totalEmAbertoFormatado}</p>
                </div>
                 <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <p className="text-xs text-red-400 uppercase">Vencidos</p>
                    <p className="text-lg font-bold text-red-400">{result.resumo.boletosVencidos}</p>
                </div>
                <div className="bg-fiber-green/10 p-3 rounded-lg border border-fiber-green/20">
                    <p className="text-xs text-fiber-green uppercase">A Vencer</p>
                    <p className="text-lg font-bold text-fiber-green">{result.resumo.boletosAVencer}</p>
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-4 flex items-center border-t border-white/10 pt-4">
                <CheckCircle className="text-fiber-green w-5 h-5 mr-2" />
                Faturas Encontradas
              </h3>
              
              {result.boletos.map((invoice, idx) => (
                <div key={invoice.id} className="bg-fiber-dark border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-fiber-orange/30 transition-colors">
                  <div className="flex-1 w-full md:w-auto text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit mx-auto md:mx-0 ${
                          invoice.statusCor === 'danger' || invoice.status.includes('Vencid')
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-fiber-green/10 text-fiber-green'
                       }`}>
                          {invoice.status}
                       </span>
                       <span className="text-gray-500 text-sm">{invoice.clienteNome}</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div>
                            <span className="text-gray-400 text-xs block uppercase tracking-wider">Vencimento</span>
                            <span className={`text-xl font-bold ${invoice.statusCor === 'danger' ? 'text-red-400' : 'text-white'}`}>
                                {invoice.vencimentoFormatado}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 text-xs block uppercase tracking-wider">Valor</span>
                            <span className="text-xl font-bold text-white">{invoice.valorFormatado}</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap justify-center md:justify-end">
                    {invoice.linhaDigitavel && (
                        <button 
                            onClick={() => copyToClipboard(invoice.linhaDigitavel!, `bar-${idx}`)}
                            className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/5 focus:outline-none focus:ring-2 focus:ring-fiber-orange whitespace-nowrap"
                            title="Copiar Código de Barras"
                        >
                            {copiedId === `bar-${idx}` ? <CheckCircle size={16} className="mr-2 text-fiber-green" /> : <Copy size={16} className="mr-2" />}
                            {copiedId === `bar-${idx}` ? 'Copiado!' : 'Copiar Código'}
                        </button>
                    )}

                    {invoice.pixCopiaECola && (
                        <button 
                            onClick={() => openPixModal(invoice.pixCopiaECola!)}
                            className="flex items-center justify-center px-4 py-2 bg-fiber-green/10 hover:bg-fiber-green/20 text-fiber-green rounded-lg text-sm font-medium transition-colors border border-fiber-green/30 focus:outline-none focus:ring-2 focus:ring-fiber-green whitespace-nowrap"
                        >
                            <QrCode size={16} className="mr-2" />
                            Ver Fatura PIX
                        </button>
                    )}
                    
                    {invoice.boleto_pdf_link ? (
                        <Button 
                            variant="outline" 
                            className="!py-2 !px-4 whitespace-nowrap"
                            onClick={() => window.open(invoice.boleto_pdf_link, '_blank')}
                        >
                            <Download size={16} className="mr-2" />
                            Baixar PDF
                        </Button>
                    ) : (
                         <Button 
                            variant="outline" 
                            className="!py-2 !px-4 opacity-50 cursor-not-allowed whitespace-nowrap"
                            disabled
                        >
                            PDF Indisponível
                        </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    <p className="text-gray-400 text-sm mt-1">Copie o código abaixo e cole no seu aplicativo bancário (Pix Copia e Cola).</p>
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
    </section>
  );
};

export default InvoiceFetcher;
