
import React, { useState } from 'react';
import { Gauge, Play, Wifi, CheckCircle2 } from 'lucide-react';
import Button from './Button';

const SpeedTestSection: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <section id="speedtest" className="py-20 bg-fiber-dark relative overflow-hidden border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fiber-blue rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fiber-orange rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-fiber-blue/10 rounded-full text-fiber-blue mb-4">
            <Gauge size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Teste de <span className="text-fiber-blue">Velocidade</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Verifique a qualidade da sua conexão agora mesmo. Para um resultado preciso, conecte seu computador via cabo de rede e feche outros programas.
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-w-5xl mx-auto min-h-[450px] relative flex flex-col">
          {!isStarted ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-20 p-8 text-center">
               <div className="relative mb-8">
                 <div className="absolute inset-0 bg-fiber-blue blur-xl opacity-20 rounded-full"></div>
                 <Gauge className="w-24 h-24 text-fiber-blue relative z-10" strokeWidth={1} />
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-4">Pronto para testar sua Ultravelocidade?</h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400 mb-8 max-w-lg w-full">
                  <div className="flex flex-col items-center">
                    <Wifi className="mb-2 text-fiber-orange" />
                    <span>Use preferencialmente cabo de rede</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="mb-2 text-fiber-green" />
                    <span>Feche downloads ativos</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Play className="mb-2 text-fiber-blue" />
                    <span>Aguarde o fim do teste</span>
                  </div>
               </div>

               <Button 
                  variant="primary"
                  className="!bg-fiber-blue hover:!bg-blue-600 shadow-lg shadow-blue-900/20 text-lg px-10 py-4"
                  onClick={() => setIsStarted(true)}
               >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  INICIAR TESTE
               </Button>
            </div>
          ) : (
            <div className="w-full h-full min-h-[600px] bg-black">
               {/* Using nPerf standard iframe as widely used by ISPs */}
               <iframe 
                  src="https://lib.nperf.com/1184/plugin/2025/index.html" 
                  className="w-full h-full min-h-[600px] border-0"
                  title="nPerf Speed Test"
                  allow="geolocation; microphone; camera"
               />
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-xs text-gray-500">
             Tecnologia fornecida por nPerf. O teste reflete a velocidade instantânea da sua conexão até o servidor de teste.
           </p>
        </div>
      </div>
    </section>
  );
};

export default SpeedTestSection;
