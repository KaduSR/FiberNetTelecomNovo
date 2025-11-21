
import React, { useState, useEffect } from 'react';
import { Menu, X, Headphones } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import Button from './Button';
import FiberNetLogo from './FiberNetLogo'; // Import the new image logo component

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenSupport?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenSupport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    if (href.startsWith('#')) {
      // If we are on a sub-page and click a hash link, go home first then scroll
      if (currentPage !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Just scroll if already on home
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // It's a page route (home, ethics, help, client-area)
      onNavigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  // Helper to check if a link is active
  const isLinkActive = (href: string) => {
    if (href.startsWith('#')) return false; 
    return currentPage === href;
  };

  return (
    <nav 
      role="navigation"
      aria-label="Menu principal"
      className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${isScrolled || currentPage !== 'home' ? 'bg-fiber-dark/95 backdrop-blur-sm py-3 shadow-lg' : 'bg-transparent py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <button 
            className="flex items-center cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded-lg p-1" 
            onClick={() => onNavigate('home')}
            aria-label="Ir para a página inicial da Fiber.Net"
          >
            <FiberNetLogo className="h-10 sm:h-12 drop-shadow-md" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={isLinkActive(item.href) ? 'page' : undefined}
                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-fiber-orange rounded px-2 py-1 ${
                  isLinkActive(item.href)
                    ? 'text-fiber-orange'
                    : 'text-gray-300 hover:text-fiber-orange'
                }`}
              >
                {item.label}
              </a>
            ))}
            
            {/* Support Icon Button */}
            <button 
              onClick={onOpenSupport}
              className="text-gray-300 hover:text-fiber-orange transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-fiber-orange"
              title="Suporte"
              aria-label="Abrir central de suporte"
            >
              <Headphones size={20} />
            </button>

            <Button 
                variant="primary" 
                className="!py-2 !px-5 text-xs uppercase tracking-wider"
                onClick={() => onNavigate('client-area')}
            >
              Área do Cliente
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-fiber-orange"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-fiber-card border-t border-gray-800 absolute w-full shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={isLinkActive(item.href) ? 'page' : undefined}
                className={`block px-3 py-3 rounded-md text-base font-medium border-b border-white/5 focus:outline-none focus:ring-2 focus:ring-fiber-orange ${
                   isLinkActive(item.href)
                    ? 'text-fiber-orange bg-white/5' 
                    : 'text-gray-300 hover:text-fiber-orange hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}
            <button 
                onClick={() => {
                    setIsOpen(false);
                    if (onOpenSupport) onOpenSupport();
                }}
                className="w-full text-left block px-3 py-3 rounded-md text-base font-medium border-b border-white/5 text-gray-300 hover:text-fiber-orange hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-fiber-orange"
            >
                Suporte / Fale Conosco
            </button>
            <div className="pt-4">
               <Button 
                  variant="primary" 
                  fullWidth
                  onClick={() => {
                      setIsOpen(false);
                      onNavigate('client-area');
                  }}
               >
                  Área do Cliente
               </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
