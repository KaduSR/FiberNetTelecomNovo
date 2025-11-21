
import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, XCircle, Smartphone, DollarSign, Gamepad2, Tv, ShieldCheck, RefreshCw } from 'lucide-react';

// Interface alinhada com o retorno real do seu backend
interface ServiceData {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'down';
  updatedAt: string;
}

const API_URL = 'https://api.centralfiber.online/api/status';

const ServiceStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState(false);

  // Lógica local para categorizar serviços, já que o backend manda apenas o ID/Nome
  const getServiceIcon = (id: string) => {
    const lowerId = id.toLowerCase();
    if (['whatsapp', 'facebook', 'instagram', 'twitter', 'tiktok', 'discord'].some(s => lowerId.includes(s))) return <Smartphone className="w-4 h-4" />;
    if (['netflix', 'youtube', 'prime', 'globo', 'spotify'].some(s => lowerId.includes(s))) return <Tv className="w-4 h-4" />;
    if (['nubank', 'inter', 'itau', 'bradesco', 'caixa', 'santander'].some(s => lowerId.includes(s))) return <DollarSign className="w-4 h-4" />;
    if (['roblox', 'fortnite', 'steam', 'psn', 'xbox', 'league'].some(s => lowerId.includes(s))) return <Gamepad2 className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const fetchData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      setLoading(true);
      setError(false);

      // Adiciona ?t=timestamp para evitar cache do navegador
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const data: ServiceData[] = await response.json();
      
      // Backend já filtra, mas garantimos aqui também
      const activeProblems = Array.isArray(data) 
        ? data.filter(item => item.status !== 'operational')
        : [];

      setServices(activeProblems);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      
    } catch (err) {
      console.warn('ServiceStatus: Falha ao atualizar.', err);
      // Em caso de erro, mantemos a lista limpa para não assustar o usuário, mas marcamos erro na UI interna
      setError(true);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000); // 15 min
    return () => clearInterval(interval);
  }, []);

  // Helpers de UI
  const getStatusConfig = (status: string) => {
    if (status === 'down') {
      return {
        color: 'text-red-500',
        bg: 'bg-red-500/10 border-red-500/20',
        icon: <XCircle className="w-5 h-5" />,
        text: 'Fora do Ar'
      };
    }
    return {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      icon: <AlertTriangle className="w-5 h-5" />,
      text: 'Instabilidade'
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-fiber-card rounded-2xl border border-white/10 p-6 md:p-8 shadow-lg">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-fiber-orange" aria-hidden="true" />
              Monitoramento de Serviços
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Status em tempo real dos principais aplicativos digitais.
            </p>
          </div>
          
          <div className="flex items-center gap-4 self-end md:self-auto">
             <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-500">Última verificação</div>
                <div className="text-fiber-orange font-mono text-sm">{lastUpdated || '--:--'}</div>
             </div>
             <button 
                onClick={fetchData} 
                disabled={loading}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors disabled:opacity-50 border border-white/5 focus:outline-none focus:ring-2 focus:ring-fiber-orange"
                title="Atualizar agora"
                aria-label="Atualizar status dos serviços"
             >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
             </button>
          </div>
        </div>

        {loading && services.length === 0 && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" role="status" aria-label="Carregando status">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5"></div>)}
          </div>
        ) : (
          <>
            {services.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-10 text-center rounded-xl border transition-all duration-500 ${error ? 'bg-neutral-900/50 border-white/10' : 'bg-green-500/5 border-green-500/20'}`}>
                <div className={`p-4 rounded-full mb-4 ${error ? 'bg-white/5 text-gray-500' : 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}>
                  {error ? <Activity size={48} aria-hidden="true" /> : <ShieldCheck size={48} aria-hidden="true" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {error ? 'Serviço Indisponível' : 'Sistemas Operando Normalmente'}
                </h3>
                <p className="text-gray-400 max-w-md text-sm">
                  {error 
                    ? 'Não foi possível conectar ao servidor de monitoramento. Tente novamente.' 
                    : 'Não detectamos instabilidades nos principais serviços (WhatsApp, Redes Sociais, Bancos) no momento.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => {
                  const statusStyle = getStatusConfig(service.status);
                  return (
                    <div key={service.id} className={`relative p-4 rounded-xl border transition-all hover:scale-[1.02] ${statusStyle.bg}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-white text-lg tracking-tight">{service.name}</div>
                        <div className={statusStyle.color}>{statusStyle.icon}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${statusStyle.color} bg-black/30`}>
                              {statusStyle.text}
                          </span>
                          <div className="text-gray-400 opacity-80" title="Categoria">
                              {getServiceIcon(service.id)}
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        
        <div className="mt-6 text-center border-t border-white/5 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-600">
                Monitoramento via Fiber.Net &bull; Downdetector
            </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;
