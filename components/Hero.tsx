import React, { useEffect, useState } from 'react';
import Button from './Button';
import { ArrowRight } from 'lucide-react';
import FiberNetTextLogo from './FiberNetTextLogo';

const Hero: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate offset based on scroll position (speed factor 0.15 for subtle parallax)
      setOffsetY(window.scrollY * 0.15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative bg-fiber-dark pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-fiber-orange rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-900 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                    <FiberNetTextLogo className="text-4xl sm:text-6xl lg:text-7xl drop-shadow-md" /> 
                    <span className="block text-2xl sm:text-4xl lg:text-5xl mt-2">Internet Fibra Óptica em <span className="text-fiber-orange">Rio das Flores</span></span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl font-light">
                Conexão Banda Larga de ultravelocidade com o melhor suporte da região. Empresa 100% local e homologada pela ANATEL.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button variant="primary" className="text-base sm:text-lg px-8 py-4 rounded-lg" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth'})}>
                    Ver Planos de Internet <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="text-base sm:text-lg px-8 py-4 rounded-lg" onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth'})}>
                    Sobre Nós
                </Button>
                </div>

                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center lg:text-left w-full border-t border-white/10 pt-10">
                <div>
                    <div className="text-3xl font-bold text-fiber-orange mb-1">100%</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Regional</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-fiber-orange mb-1">2017</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Fundação</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-fiber-orange mb-1">ANATEL</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Homologado</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-fiber-orange mb-1">Suporte</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Local</div>
                </div>
                </div>
            </div>

            {/* Image Content with Parallax Effect */}
            <div 
                className="relative order-1 lg:order-2 mb-10 lg:mb-0 flex justify-center will-change-transform"
                style={{ transform: `translateY(${offsetY}px)` }}
            >
                <div className="absolute inset-0 bg-fiber-orange/20 blur-3xl rounded-full transform translate-y-10 opacity-60"></div>
                <img 
                    src="https://res.cloudinary.com/dbblxiya7/image/upload/v1763728839/3_wmk7t6.svg"
                    alt="Mascote Fiber.Net - Internet Banda Larga Fibra Óptica em Rio das Flores" 
                    className="relative w-full max-w-[400px] lg:max-w-[500px] mx-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 z-10 animate-fly"
                    loading="eager"
                    fetchPriority="high"
                />
            </div>
            

        </div>
      </div>
    </div>
  );
};

export default Hero;