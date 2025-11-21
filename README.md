# Fiber.Net Telecom 🌐

![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2.0-purple?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)

Website institucional moderno e responsivo desenvolvido para a **Fiber.Net Telecom**, um provedor de internet 100% regional sediado em Rio das Flores/RJ. A aplicação oferece uma experiência completa para o cliente, desde a visualização de planos até uma central de ajuda com monitoramento de serviços em tempo real.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Autor](#-autor)

## 📖 Sobre o Projeto

Este projeto é uma *Single Page Application* (SPA) construída para garantir alta performance e facilidade de manutenção. O site serve como o principal ponto de contato digital da Fiber.Net, permitindo aos utilizadores conhecer planos, tirar dúvidas técnicas, entender suas faturas e acessar canais de suporte e ética.

## ✨ Funcionalidades

### 🏠 Navegação e Institucional
- **Hero Section**: Apresentação impactante com animações e chamadas para ação (CTA).
- **Roteamento Interno**: Navegação fluida entre "páginas" (Home, Ética, Ajuda, Guia) gerenciada via estado React, sem recarregamento da página.
- **Design Responsivo**: Layout adaptável para mobile, tablet e desktop utilizando Tailwind CSS.

### 🚀 Produtos e Serviços
- **Plan Cards**: Exibição dinâmica de planos de internet com destaque para ofertas especiais, preços e benefícios detalhados.
- **Valores da Empresa**: Seção destacando os pilares da empresa (Qualidade, Respeito, Valorização, Cooperação).

### 🆘 Central de Ajuda e Suporte
- **FAQ Interativo**: Perguntas frequentes organizadas por categorias (Internet, Financeiro, Wi-Fi, etc.).
- **Status de Serviços**: Monitor em tempo real que verifica a disponibilidade de serviços populares (WhatsApp, Bancos, Jogos) consumindo uma API externa (`api.centralfiber.online`).
- **Guia do Cliente**: Material educativo explicando detalhadamente como ler a fatura (boleto visual), dicas de posicionamento de roteador e segurança na rede.
- **Modal de Suporte**: Acesso rápido ao WhatsApp do suporte técnico.

### ⚖️ Ética e Compliance
- Página dedicada ao Código de Ética e Conduta.
- Canal de Denúncias integrado com garantia de anonimato.

## 🛠 Tecnologias Utilizadas

O projeto foi desenvolvido com as seguintes tecnologias principais:
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (v5.8.2)
- **Framework**: [React](https://react.dev/) (v19.2.0)
- **Build Tool**: [Vite](https://vitejs.dev/) (v6.2.0)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (via CDN e configuração local)
- **Ícones**: [Lucide React](https://lucide.dev/) (v0.554.0)

## 📂 Estrutura do Projeto

```bash
src/
├── components/          # Componentes Reutilizáveis de UI
│   ├── Navbar.tsx       # Menu de navegação responsivo
│   ├── Hero.tsx         # Seção principal da Home
│   ├── PlanCard.tsx     # Componente de exibição de planos
│   ├── ServiceStatus.tsx # Monitor de status de serviços
│   ├── SupportModal.tsx # Modal de contato via WhatsApp
│   ├── ClientGuide.tsx  # Guia educativo para o cliente
│   ├── Ethics.tsx       # Página de Ética e Compliance
│   └── ...
├── img/                 # Imagens estáticas (Logos, Mascotes)
├── App.tsx              # Componente Raiz e Lógica de Roteamento
├── constants.ts         # Textos, Dados de Planos e Configurações
├── types.ts             # Definições de Tipos TypeScript
├── index.tsx            # Ponto de entrada da aplicação
└── vite.config.ts       # Configuração do Vite

```


## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- Node.js (versão 18 ou superior recomendada)

- npm (gerenciador de pacotes)

## 🚀 Instalação e Execução

1. Clone o repositório:
 
```bash
git clone [https://github.com/KaduSR/fibernettelecomnovo.git](https://github.com/KaduSR/fibernettelecomnovo.git)
cd fibernettelecomnovo
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Acesse a aplicação: Abra o navegador em `http://localhost:3000` (ou a porta indicada no terminal).

## ⚙️ Variáveis de Ambiente

O projeto está configurado para suportar variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto se necessitar configurar chaves de API específicas (ex: Google Gemini), conforme indicado no arquivo de configuração `vite.config.ts`:



## 👤 Autor

<table style="font-family: sans-serif; color: #333;">
  <tr>
    <td style="padding-right: 15px;">
      <img src="https://res.cloudinary.com/dbblxiya7/image/upload/v1763728525/LogotipoPrincipal_o1qge4.svg" alt="Kadu Dev" width="100" style="display: block; border-radius: 5px;">
    </td>
    <td style="border-left: 2px solid #D4AF37; padding-left: 15px;">
      <b style="font-size: 16px; color: #000;">Carlos Eduardo (Kadu)</b><br>
      <span style="color: #D4AF37; font-weight: bold;">Software Developer | Kadu Dev</span><br>
      <div style="margin-top: 5px; font-size: 13px;">
        <a href="https://www.linkedin.com/in/kaduesr/" style="text-decoration: none; color: #333;">🔗 LinkedIn</a> | 
        <a href="https://github.com/KaduSR" style="text-decoration: none; color: #333;">🐙 GitHub</a>
      </div>
      <div style="margin-top: 5px; font-size: 11px; color: #666; font-style: italic;">
        "Coding with rhythm."
      </div>
    </td>
  </tr>
</table>

---

© 2025 Fiber.Net Telecom - Todos os direitos reservados.

