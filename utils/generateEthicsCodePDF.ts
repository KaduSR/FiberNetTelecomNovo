import { jsPDF } from 'jspdf';

export const generateEthicsCodePDF = () => {
  const doc = new jsPDF();
  
  // Constants for layout
  const ORANGE = '#FF6B00';
  const BLACK = '#000000';
  const GRAY = '#4B5563';
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = 20;

  // Helper to add page if needed
  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFontSize(22);
  doc.setTextColor(ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.text('Código de Ética e Conduta', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('Fiber.Net Telecom - CNPJ 22.969.088/0001-97', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Content Sections
  const sections = [
    {
      title: '1. APRESENTAÇÃO',
      text: 'Este Código estabelece os princípios éticos que regem as relações da Fiber.Net com seus colaboradores, clientes, parceiros e a sociedade. Nosso objetivo é garantir que todas as atividades sejam conduzidas com integridade, transparência e respeito, refletindo nossa missão de conectar pessoas com qualidade e confiança.'
    },
    {
      title: '2. PRINCÍPIOS FUNDAMENTAIS',
      text: 'Nossos pilares são: Integridade, Transparência, Respeito, Responsabilidade Social e Profissionalismo. Repudiamos qualquer forma de corrupção, suborno ou discriminação. Atuamos em conformidade com as leis vigentes e as normas da ANATEL.'
    },
    {
      title: '3. RELACIONAMENTO COM CLIENTES',
      text: 'Comprometemo-nos a oferecer serviços de qualidade, com informações claras e precisas. O atendimento deve ser cordial, ágil e eficiente, respeitando sempre os direitos do consumidor. Não prometemos o que não podemos cumprir e buscamos sempre a satisfação do cliente.'
    },
    {
      title: '4. SEGURANÇA DA INFORMAÇÃO',
      text: 'A proteção de dados é prioridade absoluta. Seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD), garantindo a confidencialidade e segurança das informações de clientes e da empresa. É estritamente proibido o compartilhamento não autorizado de dados sensíveis.'
    },
    {
      title: '5. CANAL DE DENÚNCIAS',
      text: 'Disponibilizamos canais seguros para reporte de violações éticas. As denúncias são tratadas com sigilo absoluto e não haverá retaliação aos denunciantes de boa-fé. Contato: etica@fibernettelecom.com ou (24) 2458-1861.'
    },
    {
      title: '6. DISPOSIÇÕES FINAIS',
      text: 'Este código deve ser seguido por todos os colaboradores. O descumprimento das normas aqui estabelecidas estará sujeito a medidas disciplinares. Este documento é revisado periodicamente para garantir sua atualização e eficácia.'
    }
  ];

  sections.forEach(section => {
    doc.setFontSize(10); // Reset font size for calculation
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(section.text, contentWidth);
    const textHeight = splitText.length * 5;
    const titleHeight = 8;
    const sectionHeight = titleHeight + textHeight + 10;

    checkPageBreak(sectionHeight);

    // Title
    doc.setFontSize(12);
    doc.setTextColor(ORANGE);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, y);
    y += 7;

    // Text
    doc.setFontSize(10);
    doc.setTextColor(BLACK);
    doc.setFont('helvetica', 'normal');
    doc.text(splitText, margin, y);
    
    y += textHeight + 8; // Spacing after paragraph
  });

  // Footer (Add to all pages)
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount} - Fiber.Net Telecom`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Gerado em ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  doc.save('Codigo-Etica-FiberNet.pdf');
};