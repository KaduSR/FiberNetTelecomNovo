
import React from 'react';
import { Instagram, MapPin, MessageCircle, ChevronRight } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import FiberNetLogo from './FiberNetLogo';

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
      if (currentPage !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reusable Link Component for animated hover effect
  const FooterLink = ({ href, label, onClick }: { href: string, label: string, onClick?: (e: React.MouseEvent) => void }) => (
    <li>
      <a 
        href={href} 
        onClick={onClick} 
        className="group flex items-center text-gray-400 hover:text-fiber-orange transition-all duration-300 ease-in-out hover:translate-x-2 focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-1 py-1"
      >
        <ChevronRight size={14} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-fiber-orange mr-1" />
        {label}
      </a>
    </li>
  );

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
                className="text-gray-400 hover:text-fiber-orange hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-base font-bold mb-6 text-white">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="home" label="Início" onClick={(e) => handleNav(e, 'home')} />
              <FooterLink href="#planos" label="Serviços" onClick={(e) => handleNav(e, '#planos')} />
              <FooterLink href="help" label="Central de Ajuda" onClick={(e) => handleNav(e, 'help')} />
              <FooterLink href="client-guide" label="Guia do Cliente" onClick={(e) => handleNav(e, 'client-guide')} />
            </ul>
          </div>

           {/* Legal Column */}
           <div>
            <h4 className="text-base font-bold mb-6 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="#" label="Política de Privacidade" />
              <FooterLink href="ethics" label="Código de Ética" onClick={(e) => handleNav(e, 'ethics')} />
              <FooterLink href="#" label="Termos de Uso" />
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-base font-bold mb-6 text-white">Contato</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <button 
                  className="flex items-center hover:text-fiber-green transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-fiber-green rounded px-1 group"
                  onClick={onOpenSupport}
                  aria-label={`Entrar em contato via WhatsApp: ${CONTACT_INFO.whatsapp}`}
                >
                  <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-fiber-green/20 transition-colors">
                    <MessageCircle className="w-4 h-4 text-fiber-green" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Atendimento WhatsApp</span>
                    <span className="font-medium text-white group-hover:text-fiber-green transition-colors">{CONTACT_INFO.whatsapp}</span>
                  </div>
                </button>
              </li>
              <li className="flex items-start px-1 group">
                <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center mr-3 mt-1 group-hover:bg-fiber-orange/20 transition-colors flex-shrink-0">
                    <MapPin className="w-4 h-4 text-fiber-orange" />
                </div>
                <span className="group-hover:text-gray-200 transition-colors">{CONTACT_INFO.address}</span>
              </li>
            </ul>
            <p className="mt-6 text-red-500 text-xs font-bold uppercase tracking-wider px-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                NÃO ACEITAMOS LIGAÇÕES!!
            </p>
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
               <a href="https://kadudev.com" target="_blank" rel="noreferrer" aria-label="Visitar site da KaduDev" className="inline-block align-middle focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded hover:opacity-80 transition-opacity">
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
