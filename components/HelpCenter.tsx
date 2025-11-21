
import React, { useState } from 'react';
import { Search, FileText, Gauge, Lock, MessageCircle, ChevronDown, ChevronUp, Globe, ChevronRight } from 'lucide-react'; 
import Button from './Button';
import ServiceStatus from './ServiceStatus';
import { CONTACT_INFO } from '../constants';
import FiberNetTextLogo from './FiberNetTextLogo';

// Data Structure grouped by Category
const FAQ_DATA: Record<string, { question: string; answer: string }[]> = {
  "Principais temas": [
    {
      question: 'Como cancelar o serviço de internet banda larga Fiber.Net?',
      answer: 'Para solicitar o cancelamento, entre em contato diretamente com nosso setor de atendimento pelo WhatsApp (24) 2458-1861 ou dirija-se à nossa loja física. Nossa equipe verificará a situação contratual e agendará a retirada dos equipamentos.'
    },
    {
      question: 'Minha internet está lenta. O que faço?',
      answer: '1. Reinicie seu roteador (desligue da tomada por 30 seg). 2. Teste via cabo de rede para descartar problemas no Wi-Fi. 3. Verifique se não há downloads pesados ocorrendo. Se persistir, contate nosso suporte.'
    },
    {
      question: 'Como alterar a senha do meu Wi-Fi?',
      answer: 'Por questões de segurança e para garantir a melhor configuração do equipamento, recomendamos solicitar a troca através do nosso WhatsApp (24) 2458-1861. Realizamos a troca remotamente em instantes.'
    }
  ],
  "Internet": [
    {
      question: 'O que é a Fibra óptica?',
      answer: 'A fibra óptica é um filamento de vidro ou polímero extremamente fino e flexível, que conduz a luz. Essa tecnologia permite a transmissão de dados em altíssima velocidade, com maior estabilidade e sem interferências eletromagnéticas, garantindo a melhor experiência de navegação.'
    },
    {
      question: 'O que é a rede FTTH (fibra até a casa) que a Fiber.Net utiliza?',
      answer: 'A rede FTTH (Fiber To The Home) é uma tecnologia que leva o cabo de fibra óptica diretamente da nossa central até dentro da sua casa. Diferente de outras tecnologias que usam cabos de cobre na parte final, a Fiber.Net garante fibra de ponta a ponta, oferecendo velocidade real e estabilidade superior.'
    },
    {
      question: 'Por que a fibra é superior a outras tecnologias?',
      answer: 'A fibra óptica não sofre interferências eletromagnéticas (raios, redes elétricas), tem capacidade de transmissão de dados infinitamente superior ao cabo de cobre ou rádio, e oferece menor latência (ping), sendo ideal para jogos, streaming em 4K e reuniões online.'
    },
    {
      question: 'O que é a velocidade de download?',
      answer: 'É a velocidade com que seu computador ou celular recebe dados da internet. É usada para carregar páginas, assistir vídeos, baixar arquivos e receber mensagens.'
    },
    {
      question: 'O que é a velocidade de upload?',
      answer: 'É a velocidade com que você envia dados para a internet. É fundamental para enviar arquivos, fazer backup na nuvem, postar vídeos nas redes sociais e para que sua imagem chegue bem em videochamadas.'
    },
    {
      question: 'Como saber se a velocidade do meu plano está chegando de acordo com o contratado?',
      answer: 'Realize o teste de velocidade preferencialmente conectado via cabo de rede ao roteador e com outros dispositivos desconectados. Sites como Speedtest ou Fast.com são recomendados. Testes via Wi-Fi podem sofrer interferências que não refletem a velocidade real que chega à sua casa.'
    },
    {
      question: 'Fiz um direcionamento de portas no meu roteador particular e não funcionou. O que pode ter acontecido?',
      answer: 'Devido à escassez de endereços IPv4 mundiais, utilizamos a tecnologia CGNAT. Para direcionamentos de porta específicos (como câmeras ou servidores), entre em contato com o suporte para verificar a disponibilidade de um IP fixo ou configuração específica na nossa ONU.'
    }
  ],
  "Redes Wi-Fi": [
    {
      question: 'O que é Wi-Fi de alta performance?',
      answer: 'Refere-se ao uso de roteadores modernos (como Dual Band AC ou Wi-Fi 6) que conseguem transmitir a velocidade da fibra óptica pelo ar com maior eficiência, utilizando frequências de 5.8GHz para maior velocidade e 2.4GHz para maior alcance.'
    },
    {
      question: 'Como melhorar o desempenho da internet nos locais da minha residência em que o Wi-Fi possui pouco sinal?',
      answer: 'Para melhorar o sinal, certifique-se de que seu roteador está em um local central e alto. Evite obstáculos como paredes muito grossas, espelhos e eletrodomésticos. Considere o uso de repetidores de sinal ou um sistema Wi-Fi Mesh para casas maiores. Se o problema persistir, nosso suporte técnico pode ajudar a otimizar a rede.'
    },
    {
      question: 'O que é Wi-Fi Mesh e como funciona?',
      answer: 'Wi-Fi Mesh é um sistema de rede sem fio que usa vários pontos de acesso (nós) para criar uma única e robusta rede Wi-Fi em toda a sua casa. Diferente dos repetidores que apenas estendem o sinal, o Mesh cria uma rede unificada e inteligente, otimizando a conexão para todos os seus dispositivos e eliminando pontos cegos.'
    },
    {
      question: 'Minha rede Wi-Fi não aparece nos dispositivos, como resolver?',
      answer: 'Primeiro, reinicie seu roteador. Se não resolver, verifique se a rede Wi-Fi não está oculta (SSID Broadcast desativado). Teste em outros dispositivos. Se ainda não aparecer, pode ser um problema de hardware ou configuração, e nosso suporte técnico deverá ser acionado.'
    },
    {
      question: 'O alcance do Wi-Fi pode variar de acordo com o plano de internet? Quanto maior a velocidade do plano de internet, maior será o sinal do Wi-Fi?',
      answer: 'Não, o alcance do Wi-Fi é determinado pela potência e tecnologia do seu roteador, e não pela velocidade contratada do plano. Um plano de maior velocidade não significa um Wi-Fi com maior alcance, mas sim uma maior capacidade de dados dentro da área de cobertura do seu roteador.'
    },
    {
      question: 'Minha conexão está muito instável, como posso resolver esse problema?',
      answer: 'Instabilidade pode ter várias causas. Tente reiniciar seu roteador e verifique se há muitos dispositivos conectados. Se a instabilidade ocorrer apenas no Wi-Fi, tente testar via cabo. Se o problema for persistente tanto no Wi-Fi quanto no cabo, pode ser um problema na rede externa, e você deve entrar em contato com nosso suporte.'
    },
    {
      question: 'Minha conexão está lenta via Wi-Fi. O que posso fazer?',
      answer: 'Primeiro, teste a velocidade via cabo. Se a lentidão for apenas no Wi-Fi, verifique o posicionamento do roteador, evite obstáculos, e veja se há muitos dispositivos ou vizinhos usando o mesmo canal Wi-Fi. A rede 5.8GHz geralmente é mais rápida em curtas distâncias. Para ajuda, contate o suporte.'
    },
    {
      question: 'Minha conexão está lenta via cabo. O que posso fazer?',
      answer: 'Se a lentidão ocorre mesmo via cabo, o problema pode estar na sua conexão externa ou na ONU/Roteador. Reinicie o equipamento e, se persistir, é crucial entrar em contato com o suporte da Fiber.Net para que eles possam diagnosticar e resolver o problema na rede.'
    },
    {
      question: 'Estou sem acesso a internet via Wi-Fi, como posso resolver?',
      answer: 'Verifique se o Wi-Fi do seu roteador está ligado (luz indicadora). Tente reiniciar o roteador e seu dispositivo. Certifique-se de que a senha está correta. Se a rede não aparecer ou não conectar após essas tentativas, contate nosso suporte para verificação.'
    },
    {
      question: 'O que e Wifi de alta performance?', 
      answer: 'Refere-se ao uso de roteadores modernos (como Dual Band AC ou Wi-Fi 6) que conseguem transmitir a velocidade da fibra óptica pelo ar com maior eficiência, utilizando frequências de 5.8GHz para maior velocidade e 2.4GHz para maior alcance.'
    }
  ],
  "Financeiro": [
    {
      question: 'Como consigo a 2ª via do meu boleto?',
      answer: 'Você pode acessar a 2ª via através da Área do Cliente no nosso site, pelo nosso aplicativo ou solicitando diretamente pelo WhatsApp (24) 2458-1861.'
    },
    {
      question: 'Onde posso pagar minha fatura?',
      answer: 'Nossos boletos são registrados e podem ser pagos em qualquer banco, lotérica ou aplicativo bancário. Recomendamos o uso do PIX para baixa instantânea.'
    }
  ],
  "Serviços": [
    {
      question: 'O que é NAT?',
      answer: 'NAT (Network Address Translation) é uma técnica que permite que vários dispositivos na sua casa naveguem usando um único endereço IP público. É essencial para o funcionamento da internet hoje em dia.'
    },
    {
      question: 'O que é o UPnP?',
      answer: 'UPnP (Universal Plug and Play) é um protocolo que permite que aplicativos e jogos abram portas no roteador automaticamente para facilitar a conexão multiplayer e chamadas de voz.'
    },
    {
      question: 'Quero mudar a ONU (modem) e/ou roteador de local dentro da minha residência, como posso fazer isso?',
      answer: 'A mudança de local de equipamentos como ONU e roteador deve ser feita por um técnico qualificado para evitar danos à fibra óptica e garantir a correta instalação. Entre em contato com nosso suporte para agendar uma visita técnica.'
    },
    {
      question: 'Minha conexão está caindo muito, o que pode estar errado?',
      answer: 'quedas frequentes de conexão podem indicar diversos problemas, desde interferências no Wi-Fi, problemas no roteador/ONU, ou até mesmo questões na rede externa. Recomendamos reiniciar seu equipamento e, se persistir, contatar nosso suporte para um diagnóstico completo.'
    },
    {
      question: 'Com relação ao meu plano de internet qual a diferença entre a velocidade contratada e a velocidade garantida?',
      answer: 'A velocidade contratada é o limite máximo que seu plano pode atingir. A velocidade garantida (ANATEL) é o mínimo que deve ser entregue (geralmente 40% da velocidade contratada na média e 80% no pico). A Fiber.Net busca entregar sempre a máxima performance possível.'
    },
    {
      question: 'Por que não consigo acessar o modem Fiber.Net para realizar configurações específicas como redirecionar portas, alterar o nome e a senha do Wi-Fi?',
      answer: 'O acesso ao painel de configuração do modem/ONU é restrito para garantir a segurança e estabilidade da rede. Para qualquer alteração, como redirecionamento de portas ou mudança de senha Wi-Fi, nossa equipe de suporte está pronta para ajudar via WhatsApp, garantindo a configuração correta e segura.'
    },
    {
      question: 'Consertaram a internet do meu vizinho e fiquei sem serviço, como posso resolver?',
      answer: 'Situações como essa, embora raras, podem ocorrer. Geralmente indicam um problema de conexão cruzada na caixa de distribuição. Entre em contato imediatamente com nosso suporte técnico via WhatsApp, informando o ocorrido, para que possamos enviar um técnico para verificar e restabelecer sua conexão o mais rápido possível.'
    }
  ],
  "Aplicativos": [
    {
      question: 'Como acessar o aplicativo Fiber.Net?',
      answer: 'Baixe nosso aplicativo nas lojas Google Play ou App Store. O login é realizado com seu CPF do titular da conta.'
    }
  ],
  "Alteração de dados": [
    {
      question: 'Como faço para alterar meus dados cadastrais?',
      answer: 'Para alterar dados como endereço, telefone ou e-mail, entre em contato com nosso atendimento via WhatsApp ou na loja física. Serão solicitados documentos para confirmação de identidade e atualização segura.'
    }
  ],
  "Segurança dos dados": [
    {
      question: 'Por que não consigo acessar o modem Fiber.Net para realizar configurações específicas?',
      answer: 'Para garantir a segurança da rede e a integridade das configurações que mantém sua conexão estável, o acesso administrativo é restrito à equipe técnica. Qualquer configuração necessária pode ser solicitada ao nosso suporte.'
    }
  ],
  "Indique um amigo": [
    {
      question: 'Como funciona o programa Indique um Amigo?',
      answer: 'Em breve, a Fiber.Net lançará um programa de indicação com benefícios exclusivos para você e seu amigo. Fique atento às nossas redes sociais e site para mais informações!'
    }
  ]
};

// All categories for the sidebar
const CATEGORIES = Object.keys(FAQ_DATA);

const HelpCenter: React.FC = () => {
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
            Tire suas dúvidas, acesse serviços rápidos ou entre em contato com nosso suporte.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Qual a sua dúvida hoje?" 
              aria-label="Buscar perguntas frequentes"
              className="w-full bg-neutral-900 border border-white/10 rounded-full py-4 px-6 pl-12 text-white focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Quick Actions (Autoatendimento) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-white/5 justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Teste de Velocidade - Converted to Button */}
          <button 
            className="bg-neutral-900 p-4 rounded-xl border border-white/5 hover:border-fiber-orange/50 transition-all cursor-pointer group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-fiber-orange"
            aria-label="Realizar teste de velocidade"
          >
            <Gauge size={24} className="text-fiber-orange mb-2" aria-hidden="true" />
            <h3 className="text-white font-bold text-sm">Teste de Velocidade</h3>
          </button>
          
          {/* WhatsApp - Converted to Button */}
          <button 
            onClick={() => window.open('https://wa.me/552424581861', '_blank')} 
            className="bg-neutral-900 p-4 rounded-xl border border-white/5 hover:border-fiber-green/50 transition-all cursor-pointer group flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-fiber-green"
            aria-label="Abrir WhatsApp para atendimento"
          >
            <MessageCircle size={24} className="text-fiber-green mb-2" aria-hidden="true" />
            <h3 className="text-white font-bold text-sm">WhatsApp</h3>
          </button>
        </div>
      </div>

      {/* Service Status Monitor */}
      <ServiceStatus />

      {/* Layout FAQ - Sidebar + Content */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden bg-neutral-900" role="tablist" aria-label="Categorias de ajuda">
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
                      className={`flex items-center justify-between p-4 text-left border-b border-white/5 last:border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-fiber-orange
                        ${isActive 
                          ? 'bg-neutral-800 border-l-4 border-l-white' 
                          : 'hover:bg-white/5 border-l-4 border-l-transparent text-fiber-orange'
                        }
                      `}
                    >
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-fiber-orange'}`}>
                        {category}
                      </span>
                      {!isActive && <ChevronRight size={16} className="text-gray-600" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-3/4" role="tabpanel">
              <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-fiber-orange h-8 flex items-center">
                {activeCategory}
              </h2>

              {currentQuestions.length === 0 ? (
                <div className="text-gray-500 p-8 text-center bg-neutral-900 rounded-lg border border-white/5">
                  Nenhum conteúdo disponível nesta categoria no momento.
                </div>
              ) : (
                <div className="space-y-4">
                  {currentQuestions.map((item, index) => (
                    <div key={index} className="bg-neutral-900 rounded-lg border border-white/5 overflow-hidden">
                      <button 
                        onClick={() => toggleFAQ(index)}
                        aria-expanded={openIndex === index}
                        className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none focus:bg-white/5 focus:ring-2 focus:ring-inset focus:ring-fiber-orange hover:bg-white/5 transition-colors group"
                      >
                        <span className={`font-medium pr-4 text-lg transition-colors ${openIndex === index ? 'text-white' : 'text-fiber-orange group-hover:text-white'}`}>
                          {item.question}
                        </span>
                        {openIndex === index ? 
                          <ChevronUp className="text-fiber-orange w-6 h-6 flex-shrink-0" aria-hidden="true" /> : 
                          <ChevronDown className="text-gray-500 w-6 h-6 flex-shrink-0" aria-hidden="true" />
                        }
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        aria-hidden={openIndex !== index}
                      >
                        <div className="px-6 pb-6 text-gray-300 text-base leading-relaxed border-t border-white/5 pt-4">
                          <FiberNetTextLogo /> {item.answer}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Changed to grid-cols-2 */}
           {/* Removed Phone Column */}
           <div className="flex flex-col items-center">
              <MessageCircle className="w-8 h-8 text-fiber-green mb-3" aria-hidden="true" />
              <h4 className="font-bold text-white">WhatsApp</h4>
              <p className="text-gray-400 text-sm">{CONTACT_INFO.whatsapp}</p>
           </div>
           <div className="flex flex-col items-center">
              <Globe className="w-8 h-8 text-fiber-blue mb-3" aria-hidden="true" />
              <h4 className="font-bold text-white">Internet</h4>
              <p className="text-gray-400 text-sm">Fibra Óptica 100%</p>
           </div>
        </div>
        <div className="mt-12">
            <Button variant="whatsapp" onClick={() => window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}`, '_blank')} aria-label="Falar com atendente no WhatsApp">
                Falar com Atendente
            </Button>
            <p className="text-[10px] text-red-500 uppercase tracking-wider font-bold mt-4">NÃO ACEITAMOS LIGAÇÕES!!</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
