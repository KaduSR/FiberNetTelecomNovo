
import React, { useState } from 'react';
import { Calendar, Tag, ExternalLink, Gamepad2, Cpu, ShieldAlert, Tv } from 'lucide-react';
import Button from './Button';

// Mock Data Structure (In a real app, fetch this from an API)
const NEWS_DATA = [
  {
    id: 1,
    category: 'Games',
    title: 'GTA 6: Rockstar confirma trailer 2 para próxima semana',
    excerpt: 'Rumores indicam que o novo trailer mostrará mais sobre a mecânica de mundo aberto e os protagonistas Jason e Lucia.',
    date: 'Hoje',
    source: 'Adrenaline',
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=900&auto=format&fit=crop',
    url: 'https://adrenaline.com.br/'
  },
  {
    id: 2,
    category: 'Tecnologia',
    title: 'Wi-Fi 7 é oficializado: O que muda na sua internet?',
    excerpt: 'Nova geração de conexão sem fio promete velocidades até 4x maiores que o Wi-Fi 6 e menor latência para jogos.',
    date: 'Ontem',
    source: 'Olhar Digital',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=900&auto=format&fit=crop',
    url: 'https://olhardigital.com.br/'
  },
  {
    id: 3,
    category: 'Streaming',
    title: 'Melhores aplicativos de IPTV legais e gratuitos em 2025',
    excerpt: 'Confira a lista atualizada de serviços de streaming gratuitos (FAST) como Pluto TV, Samsung TV Plus e outros.',
    date: '2 dias atrás',
    source: 'TechTudo',
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=900&auto=format&fit=crop',
    url: 'https://www.techtudo.com.br/'
  },
  {
    id: 4,
    category: 'Segurança',
    title: 'Novo golpe do "Boleto Falso" assusta clientes de internet',
    excerpt: 'Criminosos estão enviando e-mails falsos de operadoras. Saiba como identificar se o boleto da Fiber.Net é verdadeiro.',
    date: '3 dias atrás',
    source: 'Blog Fiber.Net',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=900&auto=format&fit=crop',
    url: '#'
  },
  {
    id: 5,
    category: 'Games',
    title: 'PlayStation 5 Pro: Vale a pena o upgrade?',
    excerpt: 'Analisamos o novo console da Sony e se o desempenho extra justifica o preço para quem joga em 4K.',
    date: '4 dias atrás',
    source: 'The Enemy',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=900&auto=format&fit=crop',
    url: 'https://www.theenemy.com.br/'
  },
  {
    id: 6,
    category: 'Tecnologia',
    title: 'WhatsApp libera edição de mensagens para todos',
    excerpt: 'Recurso muito aguardado finalmente chega à versão estável do aplicativo para Android e iOS.',
    date: '5 dias atrás',
    source: 'Canaltech',
    imageUrl: 'https://images.unsplash.com/photo-1611746317260-fe6381075e94?q=80&w=900&auto=format&fit=crop',
    url: 'https://canaltech.com.br/'
  }
];

const CATEGORIES = ['Todos', 'Tecnologia', 'Games', 'Streaming', 'Segurança'];

const NewsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filteredNews = activeFilter === 'Todos' 
    ? NEWS_DATA 
    : NEWS_DATA.filter(item => item.category === activeFilter);

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Games': return <Gamepad2 size={14} />;
      case 'Tecnologia': return <Cpu size={14} />;
      case 'Segurança': return <ShieldAlert size={14} />;
      case 'Streaming': return <Tv size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
       {/* Header */}
       <div className="bg-fiber-card py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Portal de <span className="text-fiber-orange">Notícias</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Fique por dentro das novidades sobre tecnologia, jogos, lançamentos de streaming e dicas de segurança digital.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                activeFilter === cat 
                  ? 'bg-fiber-orange border-fiber-orange text-white shadow-lg shadow-orange-900/30' 
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-fiber-orange hover:text-fiber-orange'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((news) => (
            <article 
              key={news.id} 
              className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-fiber-orange/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute top-3 left-3 z-10">
                   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/10">
                      {getCategoryIcon(news.category)}
                      {news.category}
                   </span>
                </div>
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fiber-card to-transparent opacity-80"></div>
              </div>

              {/* Content */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                   <span className="flex items-center gap-1"><Calendar size={12} /> {news.date}</span>
                   <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                   <span className="text-fiber-orange font-bold">{news.source}</span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-fiber-orange transition-colors">
                  {news.title}
                </h2>
                
                <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                  {news.excerpt}
                </p>

                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => window.open(news.url, '_blank')}
                  className="mt-auto text-xs group-hover:bg-fiber-orange group-hover:text-white group-hover:border-fiber-orange"
                >
                  Ler Matéria Completa <ExternalLink size={14} className="ml-2" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && (
             <div className="text-center py-20">
                 <p className="text-gray-500">Nenhuma notícia encontrada nesta categoria.</p>
             </div>
        )}
        
        <div className="mt-16 p-6 bg-neutral-900 rounded-xl border border-white/5 text-center">
           <h3 className="text-white font-bold mb-2">Conteúdo Curado</h3>
           <p className="text-sm text-gray-500 max-w-2xl mx-auto">
             As notícias exibidas são agregadas de fontes confiáveis do mercado de tecnologia e entretenimento para manter você informado.
           </p>
        </div>

      </div>
    </div>
  );
};

export default NewsSection;
