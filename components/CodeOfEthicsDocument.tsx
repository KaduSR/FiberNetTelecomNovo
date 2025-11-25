import React from 'react';
import { FileText, Download, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from './Button';

interface CodeOfEthicsDocumentProps {
  onNavigate?: (page: string) => void;
}

const CodeOfEthicsDocument: React.FC<CodeOfEthicsDocumentProps> = ({ onNavigate }) => {
  
  const handleDownload = () => {
    // Placeholder para link real do PDF
    // window.open('LINK_DO_PDF_AQUI', '_blank');
    alert('O download do PDF estará disponível em breve.');
  };

  return (
    <div className="bg-fiber-dark min-h-screen pt-24 pb-20 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-fiber-card py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-orange/10 rounded-full text-fiber-orange mb-6">
             <FileText size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Código de Ética e <span className="text-fiber-orange">Conduta</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Diretrizes oficiais que regem nossas relações comerciais, tratamento de dados e compromisso com a sociedade.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {onNavigate && (
            <button 
                onClick={() => onNavigate('ethics')}
                className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para Ética
            </button>
        )}

        <div className="bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-neutral-800 p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Shield size={18} className="text-green-500" />
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">VIGENTE • Rev. 2025</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
            </div>

            <div className="p-8 md:p-12 text-gray-300 leading-relaxed space-y-8 font-serif bg-[#1a1a1a]">
                <section>
                    <h3 className="text-2xl font-bold text-white mb-4 font-sans">1. Apresentação</h3>
                    <p>
                        Este Código de Ética e Conduta reflete o compromisso da <strong>Fiber.Net Telecom</strong> com a transparência, integridade e respeito em todas as suas interações.
                    </p>
                </section>

                <hr className="border-white/5" />

                <section>
                    <h3 className="text-2xl font-bold text-white mb-4 font-sans">2. Princípios Fundamentais</h3>
                    <ul className="space-y-4 list-none">
                        <li className="flex gap-4">
                            <CheckCircle className="text-fiber-orange flex-shrink-0 mt-1" size={20} />
                            <div>
                                <strong className="text-white block mb-1">Integridade</strong>
                                Agimos com honestidade e retidão, repudiando qualquer forma de corrupção.
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <CheckCircle className="text-fiber-orange flex-shrink-0 mt-1" size={20} />
                            <div>
                                <strong className="text-white block mb-1">Respeito</strong>
                                Valorizamos a diversidade e promovemos um ambiente inclusivo.
                            </div>
                        </li>
                    </ul>
                </section>

                <div className="mt-12 p-6 bg-neutral-800/50 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-white font-bold font-sans">Versão Completa</h4>
                        <p className="text-sm text-gray-500">Documento oficial em PDF.</p>
                    </div>
                    <Button onClick={handleDownload} variant="primary" className="gap-2">
                        <Download size={18} /> Baixar PDF
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOfEthicsDocument;