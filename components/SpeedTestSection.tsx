
import React, { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, Wifi, CheckCircle2, Activity, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import Button from './Button';
import FiberNetLogo from './FiberNetLogo';

const SpeedTestSection: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'ping' | 'download' | 'upload' | 'completed'>('idle');
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ip, setIp] = useState('Detectando...');

  // Refs for animation intervals
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Simulated Speed Test Logic
  const startTest = () => {
    if (status !== 'idle' && status !== 'completed') return;
    
    setStatus('ping');
    setDownload(0);
    setUpload(0);
    setPing(0);
    setJitter(0);
    setProgress(0);
    setIp('200.189.x.x (Fiber.Net)'); // Simulated IP

    // 1. Ping & Jitter Phase
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 5;
      setProgress(p);
      // Randomize values slightly for effect
      setPing(Math.floor(Math.random() * 10) + 4); 
      setJitter(Math.floor(Math.random() * 3) + 1);

      if (p >= 20) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPing(Math.floor(Math.random() * 5) + 8); // Final result ~8-13ms
        setJitter(2);
        startDownloadPhase();
      }
    }, 50);
  };

  const startDownloadPhase = () => {
    setStatus('download');
    let p = 20;
    let val = 0;
    
    intervalRef.current = setInterval(() => {
      p += 1;
      setProgress(p);
      
      // Ramp up curve
      if (p < 40) val += Math.random() * 20; // Slow start
      else val += Math.random() * 50; // Fast ramp
      
      // Cap visually around 600-700 for "Fiber" feel
      if (val > 680) val = 680 + (Math.random() * 10 - 5);
      
      setDownload(Math.floor(val));

      if (p >= 60) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDownload(650); // Final result
        startUploadPhase();
      }
    }, 50);
  };

  const startUploadPhase = () => {
    setStatus('upload');
    let p = 60;
    let val = 0;

    intervalRef.current = setInterval(() => {
      p += 1;
      setProgress(p);

      // Ramp up
      val += Math.random() * 30;
      if (val > 350) val = 350 + (Math.random() * 10 - 5);

      setUpload(Math.floor(val));

      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setUpload(320); // Final result
        setStatus('completed');
        setProgress(100);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-fiber-dark pt-32 pb-20 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-fiber-blue/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* Header with Logo */}
        <div className="mb-12 text-center">
            <div className="flex justify-center mb-6">
                <FiberNetLogo className="h-12 md:h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-marker">
                <span className="text-fiber-lime">Speed</span><span className="text-fiber-orange">Test</span>
            </h1>
            <p className="text-gray-400 mt-4 text-lg font-sans">Verifique a potência da sua ultravelocidade</p>
        </div>

        {/* Meter Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {/* Download Card */}
            <div className={`bg-neutral-900/80 backdrop-blur border rounded-2xl p-6 flex flex-col items-center transition-all duration-300 ${status === 'download' ? 'border-fiber-blue shadow-[0_0_20px_rgba(0,210,255,0.2)] scale-105' : 'border-white/5'}`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                    <ArrowDown size={16} className={status === 'download' ? 'text-fiber-blue animate-bounce' : ''} /> Download
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                    {download}<span className="text-lg text-gray-500 font-medium ml-1">Mbps</span>
                </div>
            </div>

            {/* Upload Card */}
             <div className={`bg-neutral-900/80 backdrop-blur border rounded-2xl p-6 flex flex-col items-center transition-all duration-300 ${status === 'upload' ? 'border-fiber-orange shadow-[0_0_20px_rgba(255,107,0,0.2)] scale-105' : 'border-white/5'}`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                    <ArrowUp size={16} className={status === 'upload' ? 'text-fiber-orange animate-bounce' : ''} /> Upload
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                    {upload}<span className="text-lg text-gray-500 font-medium ml-1">Mbps</span>
                </div>
            </div>

            {/* Ping Card */}
            <div className={`bg-neutral-900/80 backdrop-blur border rounded-2xl p-6 flex flex-col items-center transition-all duration-300 ${status === 'ping' ? 'border-white/40' : 'border-white/5'}`}>
                <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                    <Activity size={16} /> Ping
                </div>
                <div className="text-4xl md:text-5xl font-bold text-fiber-blue tabular-nums">
                    {status === 'idle' ? '--' : ping}<span className="text-lg text-gray-500 font-medium ml-1">ms</span>
                </div>
            </div>

             {/* Jitter Card */}
             <div className="bg-neutral-900/80 backdrop-blur border border-white/5 rounded-2xl p-6 flex flex-col items-center">
                <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs uppercase tracking-wider font-bold">
                    <Clock size={16} /> Jitter
                </div>
                <div className="text-4xl md:text-5xl font-bold text-fiber-blue tabular-nums">
                    {status === 'idle' ? '--' : jitter}<span className="text-lg text-gray-500 font-medium ml-1">ms</span>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-3xl bg-neutral-800 rounded-full h-2 mb-12 overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-fiber-blue to-fiber-orange transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        {/* Main Action Button */}
        <div className="relative group">
            <div className={`absolute inset-0 bg-fiber-blue rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${status !== 'idle' && status !== 'completed' ? 'animate-pulse' : ''}`}></div>
            <button
                onClick={startTest}
                disabled={status !== 'idle' && status !== 'completed'}
                className={`relative px-12 py-6 rounded-full font-bold text-xl uppercase tracking-widest transition-all duration-300 flex items-center gap-3 shadow-2xl
                ${status === 'idle' || status === 'completed' 
                    ? 'bg-fiber-blue hover:bg-cyan-500 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(0,210,255,0.4)]' 
                    : 'bg-neutral-800 text-gray-400 cursor-wait border border-white/10'
                }`}
            >
                {status === 'idle' && <><Play fill="currentColor" /> Iniciar Teste</>}
                {status === 'completed' && <><RefreshCw /> Testar Novamente</>}
                {(status === 'ping' || status === 'download' || status === 'upload') && <><RefreshCw className="animate-spin" /> Testando...</>}
            </button>
        </div>

        {/* Status Bar */}
        <div className="mt-12 flex items-center gap-2 text-gray-500 text-sm bg-black/30 px-6 py-2 rounded-full border border-white/5">
            <Wifi size={16} /> IP Detectado: <span className="text-white font-mono">{ip}</span>
        </div>
        
        {status === 'completed' && (
             <div className="mt-8 text-center animate-fadeIn">
                <p className="text-fiber-green flex items-center justify-center gap-2 font-bold">
                    <CheckCircle2 /> Teste Finalizado com Sucesso
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Resultados baseados em conexão cabeada ideal. O Wi-Fi pode sofrer interferências.
                </p>
             </div>
        )}

      </div>
    </div>
  );
};

export default SpeedTestSection;
