
import React, { useState, useEffect } from 'react';
import { Calendar, Tag, ExternalLink, Gamepad2, Cpu, ShieldAlert, Tv, Loader2, Newspaper, RefreshCw, Server, Search, X } from 'lucide-react';
import Button from './Button';

// Interface for our internal news structure
interface NewsArticle {
  id: string | number;
  title: string;
  excerpt: string;
  link: string;
  date: string;
  timestamp: number; // For sorting
  imageUrl: string;
  category: 'Tecnologia' | 'Games' | 'Streaming' | 'Segurança' | 'Telecom/Infra';
  source: string;
}

// Palavras que, se estiverem no título, a notícia será ignorada (Filtro de Spam/Comércio)
const BLOCKED_TERMS = [
    'cupom', 'oferta', 'desconto', 'promoção', 'barato', 'menor preço', 'comprar', 
    'leroy', 'merlin', 'amazon', 'shopee', 'magalu', 'magazine', 'achados', 'imperdível',
    'frete grátis', 'cashback', 'horóscopo', 'signo', 'bbb', 'fofoca', 'resumo da novela'
];

// RSS Feeds confiáveis
const RSS_SOURCES = [
    { url: 'https://g1.globo.com/rss/g1/tecnologia/', name: 'G1 Globo' },
    { url: 'https://olhardigital.com.br/rss', name: 'Olhar Digital' },
    { url: 'https://rss.tecmundo.com.br/feed', name: 'TecMundo' },
    { url: 'https://adrenaline.com.br/rss', name: 'Adrenaline' }
];

const NewsSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const determineCategory = (title: string, description: string): NewsArticle['category'] => {
    const text = (title + ' ' + description).toLowerCase();
    
    // Prioridade: Telecom, Infraestrutura, Falhas Globais, IPTV e Anatel
    if (text.includes('anatel') || text.includes('5g') || text.includes('fibra') || text.includes('internet') || 
        text.includes('cloudflare') || text.includes('servidor') || text.includes('caiu') || text.includes('instabilidade') || 
        text.includes('offline') || text.includes('falha global') || text.includes('bloqueio') || text.includes('iptv') ||
        text.includes('gato net') || text.includes('pirata') || text.includes('tv box') || text.includes('elon musk') || text.includes('starlink')) {
      return 'Telecom/Infra';
    }

    if (text.includes('golpe') || text.includes('vírus') || text.includes('hacker') || text.includes('segurança') || 
        text.includes('vazamento') || text.includes('senha') || text.includes('fraude') || text.includes('phishing') || 
        text.includes('malware') || text.includes('ciber') || text.includes('ataque')) {
      return 'Segurança';
    }

    if (text.includes('jogo') || text.includes('game') || text.includes('ps5') || text.includes('xbox') || 
        text.includes('nintendo') || text.includes('steam') || text.includes('gta') || text.includes('console') || 
        text.includes('epic') || text.includes('fortnite') || text.includes('roblox')) {
      return 'Games';
    }

    if (text.includes('netflix') || text.includes('disney') || text.includes('prime') || text.includes('hbo') || 
        text.includes('streaming') || text.includes('série') || text.includes('filme') || text.includes('cinema') || 
        text.includes('trailer') || text.includes('estreia') || text.includes('max')) {
      return 'Streaming';
    }

    return 'Tecnologia';
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
        // Fetch all feeds in parallel
        const promises = RSS_SOURCES.map(source => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`)
            .then(res => res.json())
            .then(data => ({ ...data, sourceName: source.name }))
            .catch(err => ({ status: 'error', sourceName: source.name }))
        );

        const results = await Promise.all(promises);
        let allArticles: NewsArticle[] = [];

        results.forEach((data: any) => {
            if (data.status === 'ok' && Array.isArray(data.items)) {
                const sourceArticles = data.items.map((item: any, index: number) => {
                    // Filtro de Bloqueio (Cupons, Ads)
                    const lowerTitle = item.title.toLowerCase();
                    if (BLOCKED_TERMS.some(term => lowerTitle.includes(term))) {
                        return null;
                    }

                    // Image Extraction Logic
                    let img = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=900&auto=format&fit=crop';
                    
                    if (item.enclosure && item.enclosure.link) {
                        img = item.enclosure.link;
                    } else if (item.thumbnail) {
                        img = item.thumbnail;
                    } else {
                        // Try to find img inside description content
                        const imgMatch = item.description.match(/src="([^"]+)"/);
                        if (imgMatch && imgMatch[1]) {
                            img = imgMatch[1];
                        }
                    }

                    // Text Cleanup
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = item.description;
                    const plainTextDesc = tempDiv.textContent || tempDiv.innerText || '';
                    const cleanExcerpt = plainTextDesc.substring(0, 110) + '...';

                    const pubDate = new Date(item.pubDate);

                    return {
                        id: `${data.sourceName}-${index}-${Math.random()}`,
                        title: item.title,
                        excerpt: cleanExcerpt,
                        link: item.link,
                        date: pubDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                        timestamp: pubDate.getTime(),
                        imageUrl: img,
                        category: determineCategory(item.title, plainTextDesc),
                        source: data.sourceName
                    };
                }).filter((article: any) => article !== null); // Remove blocked items

                allArticles = [...allArticles, ...sourceArticles];
            }
        });

        // Sort by newest first
        allArticles.sort((a, b) => b.timestamp - a.timestamp);

        // Remove duplicates (by title similarity check optional, here just taking unique links)
        const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.link, item])).values());

        if (uniqueArticles.length > 0) {
            setNews(uniqueArticles.slice(0, 12)); // Show top 12
            setUsingFallback(false);
        } else {
            throw new Error('No articles found after filtering');
        }

    } catch (error) {
      console.warn('Failed to fetch RSS feeds, using fallback data.', error);
      setNews(FALLBACK_NEWS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter Logic (Search Query Only)
  const filteredNews = news.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(query) || 
                          item.excerpt.toLowerCase().includes(query) ||
                          item.category.toLowerCase().includes(query);

    return matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Games': return <Gamepad2 size={14} />;
      case 'Tecnologia': return <Cpu size={14} />;
      case 'Segurança': return <ShieldAlert size={14} />;
      case 'Streaming': return <Tv size={14} />;
      case 'Telecom/Infra': return <Server size={14} />;
      default: return <Tag size={14} />;
    }
  };

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Telecom/Infra': return 'bg-blue-600 text-white border-blue-400';
          case 'Segurança': return 'bg-red-600 text-white border-red-400';
          case 'Games': return 'bg-purple-600 text-white border-purple-400';
          default: return 'bg-black/70 text-white border-white/10';
      }
  }

  return (
    <div className="bg-fiber-dark min-h-screen pt-24">
       {/* Header */}
       <div className="bg-fiber-card py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Portal de <span className="text-fiber-orange">Notícias</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Fique por dentro das novidades sobre telecomunicações, segurança digital, tecnologia e entretenimento.
          </p>
          
          {usingFallback && !loading && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
               <Newspaper size={12} className="mr-2" /> Exibindo notícias arquivadas (Offline)
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search & Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-1/2 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-fiber-orange transition-colors">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por IPTV, jogos, falhas..."
                    className="w-full h-12 pl-11 pr-10 bg-neutral-900 border border-white/10 rounded-full text-white focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all placeholder-gray-600"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors focus:outline-none"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Refresh */}
            <div className="flex items-center justify-center lg:justify-end">
                <button 
                    onClick={fetchNews} 
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors disabled:opacity-50 border border-white/5 focus:outline-none focus:ring-2 focus:ring-fiber-orange"
                    title="Atualizar Notícias"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Atualizando...' : 'Atualizar Feed'}
                </button>
            </div>
        </div>

        {/* Content Area */}
        {loading ? (
             <div className="flex flex-col items-center justify-center py-32">
                 <Loader2 size={48} className="text-fiber-orange animate-spin mb-4" />
                 <p className="text-gray-400 animate-pulse">Buscando as últimas novidades no G1, TecMundo e Olhar Digital...</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {filteredNews.map((item) => (
                <article 
                key={item.id} 
                className="bg-fiber-card border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-fiber-orange/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group h-full"
                >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-neutral-900">
                    <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/10 shadow-lg ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        {item.category}
                    </span>
                    </div>
                    <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                        // Fallback image if fetch fails
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=900&auto=format&fit=crop';
                    }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-fiber-card via-transparent to-transparent opacity-80"></div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span className="text-fiber-orange font-bold truncate max-w-[120px]">{item.source}</span>
                    </div>
                    
                    <h2 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-fiber-orange transition-colors line-clamp-3">
                    {item.title}
                    </h2>
                    
                    <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {item.excerpt}
                    </p>

                    <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={() => window.open(item.link, '_blank')}
                    className="mt-auto text-xs group-hover:bg-fiber-orange group-hover:text-white group-hover:border-fiber-orange"
                    title={`Ler matéria completa em ${item.source}`}
                    >
                    Ler Matéria Completa <ExternalLink size={14} className="ml-2" />
                    </Button>
                </div>
                </article>
            ))}
            </div>
        )}

        {!loading && filteredNews.length === 0 && (
             <div className="text-center py-20 bg-neutral-900/50 rounded-xl border border-white/5">
                 <Search size={48} className="text-gray-600 mx-auto mb-4" />
                 <p className="text-gray-400 text-lg font-medium">Nenhuma notícia encontrada.</p>
                 <p className="text-gray-500 text-sm">
                    {searchQuery 
                        ? `Não encontramos resultados para "${searchQuery}".` 
                        : `Não há notícias disponíveis no momento.`
                    }
                 </p>
                 <div className="mt-4 flex justify-center gap-4">
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-fiber-orange text-sm hover:underline">
                            Limpar busca
                        </button>
                    )}
                 </div>
             </div>
        )}
        
        <div className="mt-16 p-6 bg-neutral-900 rounded-xl border border-white/5 text-center">
           <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
               <Newspaper size={16} className="text-fiber-orange" /> 
               Agregador de Conteúdo Inteligente
           </h3>
           <p className="text-sm text-gray-500 max-w-2xl mx-auto">
             As notícias exibidas são coletadas automaticamente de fontes públicas (G1, TecMundo, Olhar Digital, Adrenaline) e filtradas por inteligência artificial para focar em Telecom, Segurança e Tecnologia. Conteúdos de terceiros são de responsabilidade de seus autores.
           </p>
        </div>

      </div>
    </div>
  );
};

// Fallback data update
const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: 1,
    category: 'Telecom/Infra',
    title: 'Anatel anuncia novas medidas contra "GatoNet" e TV Box pirata',
    excerpt: 'Agência reguladora intensifica bloqueio de IPs servidores utilizados por aparelhos não homologados no Brasil.',
    date: 'Hoje, 10:00',
    timestamp: Date.now(),
    source: 'G1 Globo',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=900&auto=format&fit=crop',
    link: 'https://g1.globo.com/tecnologia'
  },
  {
    id: 2,
    category: 'Segurança',
    title: 'Cloudflare corrige falha que causou instabilidade global em sites',
    excerpt: 'Diversas plataformas como Discord e serviços de banco ficaram fora do ar nesta manhã devido a erro de roteamento.',
    date: 'Ontem, 14:30',
    timestamp: Date.now() - 86400000,
    source: 'Olhar Digital',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=900&auto=format&fit=crop',
    link: 'https://olhardigital.com.br/'
  },
  {
    id: 3,
    category: 'Games',
    title: 'Servidores da PSN apresentam lentidão; Sony investiga',
    excerpt: 'Jogadores relatam dificuldades para baixar jogos e acessar partidas online no PlayStation 5 e 4.',
    date: '2 dias atrás',
    timestamp: Date.now() - 172800000,
    source: 'Adrenaline',
    imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=900&auto=format&fit=crop',
    link: 'https://adrenaline.com.br/'
  }
];

export default NewsSection;
