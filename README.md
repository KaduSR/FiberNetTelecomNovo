# Fiber.Net Telecom

Website institucional moderno e responsivo desenvolvido para a **Fiber.Net Telecom**, um provedor de internet regional em Rio das Flores/RJ. A aplicação oferece uma experiência completa para o utilizador, incluindo apresentação de planos, central de ajuda, visualização de faturas e canais de suporte.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna focada em performance e tipagem estática:

- **[React 19](https://react.dev/)**: Biblioteca principal para construção da interface.
- **[Vite](https://vitejs.dev/)**: Ferramenta de build e servidor de desenvolvimento rápido.
- **[TypeScript](https://www.typescriptlang.org/)**: Para maior segurança e manutenção do código.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utilizado para estilização (via CDN script).
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones leves e consistentes.

## 📋 Funcionalidades

- **Apresentação de Planos**: Cards interativos (`PlanCard`) com detalhes de velocidade, benefícios e preços.
- **Navegação SPA**: Roteamento interno manual para uma experiência fluida sem recarregamentos (`App.tsx`).
- **Central de Ajuda**:
  - FAQ categorizado com acordeões.
  - **Monitor de Status**: Verifica em tempo real o status de serviços populares (WhatsApp, Bancos, Jogos) via API externa (`ServiceStatus.tsx`).
- **Área do Cliente**:
  - Guia visual explicativo de boletos bancários.
  - Dicas de otimização de Wi-Fi e segurança.
- **Ética e Compliance**: Página dedicada ao código de conduta e canal de denúncias.
- **Suporte**: Modal de contato integrado e botão flutuante para WhatsApp.

## 📂 Estrutura do Projeto

A organização do código segue uma estrutura modular:

```text
src/
├── components/        # Componentes de UI reutilizáveis
│   ├── Button.tsx     # Botões padronizados
│   ├── Navbar.tsx     # Menu responsivo
│   ├── ServiceStatus.tsx # Integração com API de status
│   └── ...
├── img/              # Assets e logótipos
├── constants.ts      # Dados estáticos (Planos, Textos, Contatos)
├── types.ts          # Interfaces e Tipos TypeScript
├── App.tsx           # Componente Raiz e Lógica de Roteamento
└── main.tsx          # Ponto de entrada da aplicação
