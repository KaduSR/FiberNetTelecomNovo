
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, RefreshCw, Wifi, CheckCircle2, Activity, ArrowDown, ArrowUp, Clock, AlertTriangle } from 'lucide-react';
import FiberNetLogo from './FiberNetLogo';
import { ENDPOINTS } from '../src/config';

const SpeedTestSection: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [download, setDownload] = useState(0);
    const [upload, setUpload] = useState(0);
    const [ping, setPing] = useState(0);
    const [jitter, setJitter] = useState(0);
    const [progress, setProgress] = useState(0);
    const [ip, setIp] = useState('Detectando...');
    
    // Simulação visual enquanto o backend processa
    const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, []);

    // Fallback de simulação caso o backend falhe (para UI Demo)
    const runSimulationFallback = useCallback(() => {
        return new Promise<void>(resolve => {
            let p = 0;
            simulationInterval.current = setInterval(() => {
                p += 2;
                setProgress(Math.min(p, 90));
                
                // Random values visual effect
                setPing(Math.floor(Math.random() * 10) + 5);
                setDownload(Math.floor(Math.random() * 200) + 300);
                setUpload(Math.floor(Math.random() * 100) + 150);
                setJitter(Math.floor(Math.random() * 3));

                if (p >= 100) {
                    if (simulationInterval.current) clearInterval(simulationInterval.current);
                    // Final fixed values
                    setPing(8);
                    setJitter(2);
                    setDownload(520);
                    setUpload(280);
                    resolve();
                }
            }, 100);
        });
    }, []); 

    // Função para iniciar o teste via Backend
    const startTest = useCallback(async () => {
        if (status === 'running') return;
        
        setStatus('running');
        setDownload(0);
        setUpload(0);
        setPing(0);
        setJitter(0);
        setProgress(0);
        setIp('Conectando ao servidor...');

        let progressInterval: ReturnType<typeof setInterval> | null = null; 

        try {
            // Inicia animação de progresso falsa (dá feedback visual imediato)
            let fakeProgress = 0;
            progressInterval = setInterval(() => {
                fakeProgress += 1;
                // Simula um pouco o download para ter feedback
                setDownload(Math.floor(Math.random() * 100)); 
                if (fakeProgress < 90) setProgress(fakeProgress);
            }, 200);

            // Chamada ao Backend usando configuração centralizada
            const response = await fetch(ENDPOINTS.SPEEDTEST_RUN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            // Limpeza antecipada para evitar que o bloco finally gere um erro de limpeza dupla
            if (progressInterval) clearInterval(progressInterval); 

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Falha ao executar teste. Status: ' + response.status);
            }

            const result = await response.json();
            
            // Atualiza com os dados reais do backend
            setPing(result.ping || 0);
            setJitter(result.jitter || 0);
            setDownload(result.download || 0);
            setUpload(result.upload || 0);
            setIp(result.clientIp || 'IP não detectado');
            
            setProgress(100);
            setStatus('completed');

        } catch (error) {
            console.error("Erro no teste:", error);
            
            // Limpa o intervalo no erro
            if (progressInterval) clearInterval(progressInterval); 

            // Roda simulação para demonstrar resultados
            await runSimulationFallback();
            
            setStatus('error'); 
            setIp('Falha de Conexão (Simulado)');
            
        } finally {
             // Garante que o intervalo é parado
             if (progressInterval) clearInterval(progressInterval); 
        }
    }, [status, runSimulationFallback]);

    return (
        <div className="min-h-screen bg-neutral-950 pt-32 pb-20 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
                
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="flex justify-center mb-6 text-cyan-400">
                        <FiberNetLogo className="h-16 w-16" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        <span className="text-cyan-400">Speed</span><span className="text-orange-500">Test</span>
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg font-sans">
                        Teste oficial via Servidor Fiber.Net (Powered by Ookla)
                    </p>
                </div>

                {/* Cards de Resultados */}
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                    {/* Download */}
                    <div className={`bg-neutral-900/80 backdrop-blur border rounded-2xl p-6 flex flex-col items-center transition-all duration-300 ${status === 'running' ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-105' : 'border-white/5'}`}>
                        <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                            <ArrowDown size={16} className={status === 'running' ? 'text-cyan-400 animate-bounce' : ''} /> Download
                        </div>
                        <div className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                            {download.toFixed(1)}<span className="text-lg text-gray-500 font-medium ml-1">Mbps</span>
                        </div>
                    </div>

                    {/* Upload */}
                    <div className={`bg-neutral-900/80 backdrop-blur border rounded-2xl p-6 flex flex-col items-center transition-all duration-300 ${status === 'running' ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-105' : 'border-white/5'}`}>
                        <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                            <ArrowUp size={16} className={status === 'running' ? 'text-orange-500 animate-bounce' : ''} /> Upload
                        </div>
                        <div className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                            {upload.toFixed(1)}<span className="text-lg text-gray-500 font-medium ml-1">Mbps</span>
                        </div>
                    </div>

                    {/* Ping */}
                    <div className={`bg-neutral-900/80 backdrop-blur border rounded-2xl p-6 flex flex-col items-center transition-all duration-300 ${status === 'running' ? 'border-white/40' : 'border-white/5'}`}>
                        <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                            <Activity size={16} /> Ping
                        </div>
                        <div className="text-4xl md:text-5xl font-bold text-cyan-400 tabular-nums">
                            {ping.toFixed(1)}<span className="text-lg text-gray-500 font-medium ml-1">ms</span>
                        </div>
                    </div>

                    {/* Jitter */}
                    <div className="bg-neutral-900/80 backdrop-blur border border-white/5 rounded-2xl p-6 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                            <Clock size={16} /> Jitter
                        </div>
                        <div className="text-4xl md:text-5xl font-bold text-cyan-400 tabular-nums">
                            {jitter.toFixed(1)}<span className="text-lg text-gray-500 font-medium ml-1">ms</span>
                        </div>
                    </div>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full max-w-3xl bg-neutral-800 rounded-full h-2 mb-12 overflow-hidden relative">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-orange-500 transition-all duration-200 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Botão de Ação */}
                <div className="relative group">
                    <div className={`absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${status === 'running' ? 'animate-pulse' : ''}`}></div>
                    <button
                        onClick={startTest}
                        disabled={status === 'running'}
                        className={`relative px-12 py-6 rounded-full font-bold text-xl uppercase tracking-widest transition-all duration-300 flex items-center gap-3 shadow-2xl
                        ${status !== 'running'
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]' 
                            : 'bg-neutral-800 text-gray-400 cursor-wait border border-white/10'
                        }`}
                    >
                        {status === 'idle' && <><Play fill="currentColor" /> Iniciar Teste</>}
                        {status === 'completed' && <><RefreshCw /> Testar Novamente</>}
                        {status === 'error' && <><AlertTriangle className="text-red-500" /> Tentar Novamente</>}
                        {status === 'running' && <><RefreshCw className="animate-spin" /> Medindo...</>}
                    </button>
                </div>

                {/* Status Bar */}
                <div className="mt-12 flex items-center gap-2 text-gray-500 text-sm bg-black/30 px-6 py-2 rounded-full border border-white/5">
                    <Wifi size={16} /> IP: <span className="text-white font-mono">{ip}</span>
                </div>
                
                {(status === 'completed' || status === 'error') && (
                    <div className="mt-8 text-center animate-fadeIn">
                         {status === 'completed' ? (
                            <p className="text-green-500 flex items-center justify-center gap-2 font-bold">
                                <CheckCircle2 /> Teste Finalizado com Sucesso
                            </p>
                        ) : (
                             <p className="text-red-500 flex items-center justify-center gap-2 font-bold">
                                <AlertTriangle /> Erro! Resultados podem ser simulados.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeedTestSection;
