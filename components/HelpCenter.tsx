
import React, { useState } from 'react';
import { Search, Gauge, MessageCircle, ChevronDown, ChevronUp, Globe, ChevronRight, Tv, Activity } from 'lucide-react'; 
import Button from './Button';
import { CONTACT_INFO } from '../constants';
import FiberNetTextLogo from './FiberNetTextLogo';

interface HelpCenterProps {
    onNavigate?: (page: string) => void;
}

// Data Structure grouped by Category
const FAQ_DATA: Record<string, { question: string; answer: string }[]> = {
  "Principais temas": [
    {
      question: 'Como cancelar o serviço de internet banda larga Fiber.Net?',
      answer: 'Para solicitar o cancelamento, entre em contato diretamente com nosso setor de atendimento pelo WhatsApp (24) 2458-1861 ou dirija-se à nossa loja física. Nossa equipe verificará a situação contratual e agendará a retirada dos equipamentos.'
    },
    {
      question: 'Esqueci minha senha da Área do Cliente, o que fazer?',
      answer: 'Na tela de login da Área do Cliente, clique no link "Esqueceu a senha?". Você será redirecionado automaticamente para o nosso WhatsApp, onde um atendente confirmará seus dados e realizará o reset da senha com segurança.'
    },
    {
      question: 'Minha internet está lenta. O que faço?',
      answer: '1. Reinicie seu roteador (desligue da tomada por 30 seg). 2. Teste via cabo de rede para descartar problemas no Wi-Fi. 3. Verifique se não há downloads pesados ocorrendo. Se persistir, contate nosso suporte.'
    }
  ],
  "Internet & Conectividade": [
    {
      question: 'O que é a rede FTTH (fibra até a casa)?',
      answer: 'A rede FTTH (Fiber To The Home) é uma tecnologia que leva o cabo de fibra óptica diretamente da nossa central até dentro da sua casa. Diferente de tecnologias antigas, a Fiber.Net garante fibra de ponta a ponta, oferecendo velocidade real e estabilidade superior.'
    },
    {
      question: 'Diferença entre 2.4GHz e 5GHz',
      answer: 'A rede 2.4GHz tem maior alcance (atravessa mais paredes), mas menor velocidade máxima. A rede 5GHz entrega altíssima velocidade, ideal para Streaming 4K e Jogos, mas tem menor alcance. Sempre que possível, conecte-se à rede 5GHz se estiver no mesmo cômodo do roteador.'
    }
  ],
  "Redes Wi-Fi": [
    {
      question: 'Como otimizar o alcance do meu Wi-Fi?',
      answer: 'Para otimizar o alcance, certifique-se de que o roteador está em um local central e elevado, longe de obstáculos e interferências. Considere o uso de repetidores ou kits Mesh para cobrir áreas maiores.'
    },
    {
      question: 'O que é Wi-Fi Mesh e como funciona?',
      answer: 'Wi-Fi Mesh utiliza múltiplos pontos de acesso para criar uma única rede Wi-Fi ampla e estável em toda a sua casa, eliminando zonas de sombra e garantindo conexão de alta velocidade em qualquer lugar.'
    }
  ],
  "Streaming e Apps (IPTV)": [
    {
      question: 'Minha TV Box ou IPTV está travando, é a internet?',
      answer: 'Nem sempre. Serviços de IPTV (especialmente listas não oficiais) sofrem frequentemente com sobrecarga nos servidores deles, independente da qualidade da sua internet. Teste se o YouTube ou Netflix funcionam em 4K; se funcionarem bem, o problema é no servidor do aplicativo de IPTV, e não na Fiber.Net.'
    },
    {
      question: 'Qual a velocidade recomendada para assistir em 4K?',
      answer: 'Para serviços oficiais como Netflix, Disney+ e YouTube, recomendamos pelo menos 25 Mega dedicados apenas para a TV. Nossos planos de entrada já suportam múltiplos fluxos em 4K simultaneamente.'
    },
    {
      question: 'Onde encontro notícias sobre novos jogos e aplicativos?',
      answer: 'Acesse a nova seção "Notícias" no menu principal do nosso site. Lá publicamos semanalmente novidades sobre lançamentos de jogos, atualizações de segurança e dicas de aplicativos de streaming confiáveis.'
    }
  ],
  "Segurança Digital": [
    {
      question: 'Como me proteger de golpes na internet?',
      answer: 'Nunca clique em links suspeitos enviados por SMS ou WhatsApp prometendo prêmios. A Fiber.Net nunca solicita sua senha bancária ou do cartão de crédito por telefone. Verifique sempre o remetente dos e-mails.'
    },
    {
      question: 'É seguro salvar minha senha no navegador?',
      answer: 'Embora prático, recomendamos o uso de Gerenciadores de Senha dedicados. Se usar o navegador, certifique-se de ter uma senha mestra no computador e mantenha o antivírus atualizado.'
    },
    {
      question: 'O que é Phishing?',
      answer: 'É uma técnica usada por criminosos para enganar você e roubar dados. Eles criam sites falsos que parecem reais (como de bancos). Sempre confira a URL (endereço) do site antes de digitar seus dados.'
    }
  ],
  "Financeiro": [
    {
      question: 'Onde posso pagar minha fatura com baixa rápida?',
      answer: 'Recomendamos fortemente o pagamento via PIX (Copia e Cola ou QR Code) presente na fatura. A baixa é praticamente instantânea, evitando bloqueios automáticos nos finais de semana.'
    },
    {
      question: 'Como consigo a 2ª via do boleto?',
      answer: 'Acesse a "Área do Cliente" no topo do site. Basta fazer login com seu e-mail e senha para visualizar e baixar todas as faturas em aberto.'
    }
  ],
  "Suporte Técnico": [
    {
      question: 'Não consigo acessar o modem para trocar a senha.',
      answer: 'Por segurança, o acesso às configurações internas da ONU é restrito. Para trocar o nome ou senha do seu Wi-Fi, chame nosso suporte no WhatsApp. Fazemos isso remotamente em poucos minutos.'
    },
    {
      question: 'Luz "LOS" vermelha piscando no modem.',
      answer: 'Isso indica que não está chegando sinal de fibra óptica no equipamento (possível rompimento de cabo na rua ou dentro de casa). Entre em contato imediatamente com o suporte técnico.'
    }
  ]
};

// All categories for the sidebar
const CATEGORIES = Object.keys(FAQ_DATA);

const HelpCenter: React.FC<HelpCenterProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>("Principais temas");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Get questions for current category, default to empty array if none
  const currentQuestions = FAQ_DATA[activeCategory] || [];

  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
      {/* Hero / Search Section */}
      <div className="bg-fiber-card py-16 border-b border-white/5 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-fiber-orange opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Central de <span className="text-fiber-orange">Ajuda</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Tire suas dúvidas, acesse serviços rápidos ou entre em contato com nosso suporte especializado.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Qual a sua dúvida hoje?" 
              aria-label="Buscar perguntas frequentes"
              className="w-full bg-neutral-900 border border-white/10 rounded-full py-4 px-6 pl-12 text-white focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-500 shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Quick Actions (Autoatendimento) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Teste de Velocidade */}
          <button 
            className="bg-neutral-900 p-4 rounded-xl border border-white/5 hover:border-fiber-orange/50 transition-all cursor-pointer group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-fiber-orange"
            aria-label="Realizar teste de velocidade"
            onClick={() => window.open('https://www.speedtest.net/', '_blank')}
          >
            <Gauge size={24} className="text-fiber-orange mb-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-white font-bold text-sm">Teste de Velocidade</h3>
          </button>

          {/* Status dos Serviços */}
          <button 
            className="bg-neutral-900 p-4 rounded-xl border border-white/5 hover:border-fiber-orange/50 transition-all cursor-pointer group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-fiber-orange"
            aria-label="Verificar status dos serviços"
            onClick={() => onNavigate?.('status')}
          >
            <Activity size={24} className="text-fiber-orange mb-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-white font-bold text-sm">Status Serviços</h3>
          </button>

           {/* Streaming & Apps */}
           <button 
            onClick={() => setActiveCategory("Streaming e Apps (IPTV)")}
            className="bg-neutral-900 p-4 rounded-xl border border-white/5 hover:border-fiber-orange/50 transition-all cursor-pointer group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-fiber-orange"
          >
            <Tv size={24} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-white font-bold text-sm">Streaming & Apps</h3>
          </button>
          
          {/* WhatsApp */}
          <button 
            onClick={() => window.open('https://wa.me/552424581861', '_blank')} 
            className="bg-neutral-900 p-4 rounded-xl border border-white/5 hover:border-fiber-green/50 transition-all cursor-pointer group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-fiber-green"
            aria-label="Abrir WhatsApp para atendimento"
          >
            <MessageCircle size={24} className="text-fiber-green mb-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <h3 className="text-white font-bold text-sm">WhatsApp</h3>
          </button>
        </div>
      </div>

      {/* Layout FAQ - Sidebar + Content */}
      <div className="bg-black py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden bg-neutral-900 sticky top-24" role="tablist" aria-label="Categorias de ajuda">
                <div className="p-4 bg-fiber-card border-b border-white/5 font-bold text-white">
                    Categorias
                </div>
                {CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveCategory(category);
                        setOpenIndex(null); // Reset accordion when changing category
                      }}
                      className={`flex items-center justify-between p-4 text-left border-b border-white/5 last:border-0 transition-all focus:outline-none
                        ${isActive 
                          ? 'bg-neutral-800 text-white border-l-4 border-l-fiber-orange pl-3' 
                          : 'hover:bg-white/5 text-gray-400 hover:text-fiber-orange border-l-4 border-l-transparent'
                        }
                      `}
                    >
                      <span className="font-medium text-sm">
                        {category}
                      </span>
                      {isActive && <ChevronRight size={16} className="text-fiber-orange" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-3/4" role="tabpanel">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-fiber-orange rounded-full"></span>
                {activeCategory}
              </h2>

              {currentQuestions.length === 0 ? (
                <div className="text-gray-500 p-8 text-center bg-neutral-900 rounded-lg border border-white/5">
                  Nenhum conteúdo disponível nesta categoria no momento.
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestions.map((item, index) => (
                    <div key={index} className="bg-neutral-900 rounded-lg border border-white/5 overflow-hidden transition-all hover:border-fiber-orange/20">
                      <button 
                        onClick={() => toggleFAQ(index)}
                        aria-expanded={openIndex === index}
                        className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:bg-white/5 transition-colors group"
                      >
                        <span className={`font-medium pr-4 text-lg transition-colors ${openIndex === index ? 'text-fiber-orange' : 'text-white group-hover:text-gray-200'}`}>
                          {item.question}
                        </span>
                        {openIndex === index ? 
                          <ChevronUp className="text-fiber-orange w-6 h-6 flex-shrink-0" aria-hidden="true" /> : 
                          <ChevronDown className="text-gray-500 w-6 h-6 flex-shrink-0 group-hover:text-white" aria-hidden="true" />
                        }
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden bg-black/20 ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                        aria-hidden={openIndex !== index}
                      >
                        <div className="px-6 pb-6 pt-2 text-gray-300 text-base leading-relaxed">
                          <div className="w-full h-px bg-white/5 mb-4"></div>
                          <FiberNetTextLogo className="text-sm opacity-50 mr-1" /> {item.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Contact Footer Banner */}
      <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-8">Ainda precisa de ajuda?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex flex-col items-center p-6 bg-fiber-card rounded-xl border border-white/5">
              <MessageCircle className="w-8 h-8 text-fiber-green mb-3" aria-hidden="true" />
              <h4 className="font-bold text-white">Atendimento WhatsApp</h4>
              <p className="text-gray-400 text-sm mt-2">Suporte técnico e financeiro ágil</p>
              <p className="text-fiber-green font-mono mt-1">{CONTACT_INFO.whatsapp}</p>
           </div>
           <div className="flex flex-col items-center p-6 bg-fiber-card rounded-xl border border-white/5">
              <Globe className="w-8 h-8 text-fiber-blue mb-3" aria-hidden="true" />
              <h4 className="font-bold text-white">Área do Cliente</h4>
              <p className="text-gray-400 text-sm mt-2">2ª via, contratos e serviços</p>
              <div className="pt-4">
               <Button 
                  variant="primary" 
                  fullWidth
                  onClick={() => {
                      if(onNavigate) onNavigate('client-area');
                  }}
               >
                  Área do Cliente
               </Button>
            </div>
           </div>
        </div>
        <div className="mt-12">
            <Button variant="whatsapp" onClick={() => window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}`, '_blank')} aria-label="Falar com atendente no WhatsApp">
                Iniciar Atendimento
            </Button>
            <p className="text-[10px] text-red-500 uppercase tracking-wider font-bold mt-4">NÃO ACEITAMOS LIGAÇÕES!!</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
