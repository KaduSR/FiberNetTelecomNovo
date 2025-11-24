
import React from 'react';
import { Instagram, MapPin, MessageCircle } from 'lucide-react'; // Removed Facebook, Linkedin, Twitter
import { CONTACT_INFO } from '../constants';
import FiberNetLogo from './FiberNetLogo'; // Import the new image logo component

interface FooterProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onOpenSupport?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, currentPage, onOpenSupport }) => {
  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (!onNavigate) return;

    if (href.startsWith('#')) {
      // If it's a section link (like #planos)
      if (currentPage !== 'home') {
        // Navigate to home first
        onNavigate('home');
        // Wait for home to render then scroll
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Already on home, just scroll
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // It's a page link (home, help, ethics)
      onNavigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-fiber-card text-white pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div>
            <div 
              className="mb-6 select-none cursor-pointer inline-block focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded" 
              onClick={(e) => handleNav(e, 'home')}
              role="button"
              tabIndex={0}
              aria-label="Voltar para página inicial"
              onKeyDown={(e) => e.key === 'Enter' && handleNav(e as any, 'home')}
            >
               <FiberNetLogo className="h-8 sm:h-10" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Conectando você ao mundo! Internet de qualidade 100% regional, homologada pela ANATEL.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/fibernettelecom_" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram" 
                className="text-gray-400 hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-base font-bold mb-6 text-white">Links Rápidos</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="home" onClick={(e) => handleNav(e, 'home')} className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Início</a></li>
              <li><a href="#planos" onClick={(e) => handleNav(e, '#planos')} className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Serviços</a></li>
              <li><a href="help" onClick={(e) => handleNav(e, 'help')} className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Central de Ajuda</a></li>
              <li><a href="client-guide" onClick={(e) => handleNav(e, 'client-guide')} className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Guia do Cliente</a></li>
            </ul>
          </div>

           {/* Legal Column */}
           <div>
            <h4 className="text-base font-bold mb-6 text-white">Legal</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Política de Privacidade</a></li>
              <li><a href="ethics" onClick={(e) => handleNav(e, 'ethics')} className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Código de Ética</a></li>
              <li><a href="#" className="hover:text-fiber-orange transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1">Termos de Uso</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-base font-bold mb-6 text-white">Contato</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <button 
                  className="flex items-center hover:text-fiber-green transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-fiber-green rounded px-1"
                  onClick={onOpenSupport}
                  aria-label={`Entrar em contato via WhatsApp: ${CONTACT_INFO.whatsapp}`}
                >
                  <MessageCircle className="w-4 h-4 mr-3 text-fiber-green flex-shrink-0" />
                  <span>WhatsApp: {CONTACT_INFO.whatsapp}</span>
                </button>
              </li>
              <li className="flex items-start px-1">
                <MapPin className="w-4 h-4 mr-3 text-fiber-orange flex-shrink-0 mt-1" />
                <span>{CONTACT_INFO.address}</span>
              </li>
            </ul>
            <p className="mt-6 text-red-500 text-xs font-bold uppercase tracking-wider px-1">NÃO ACEITAMOS LIGAÇÕES!!</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="text-center md:text-left">
             <p>&copy; 2025 Fiber.Net - Todos os direitos reservados.</p>
             <p className="mt-1">TELECOM FIBER NET LTDA - CNPJ: 22.969.088/0001-97</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
             <span>
               Desenvolvido e Gerenciado por{' '}
               <a href="https://kadudev.com" target="_blank" rel="noreferrer" aria-label="Visitar site da KaduDev" className="inline-block align-middle focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded">
                 <img 
                   src="https://images.unsplash.com/vector-1763657979649-8d8d789164df?q=80&w=880&auto=format&fit=crop&fm=webp&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                   alt="KaduDev Logo" 
                   className="h-20 sm:h-24 w-auto object-contain" 
                   width="880" 
                   height="200"
                   loading="lazy"
                 />
               </a>
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
