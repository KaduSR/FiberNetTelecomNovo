import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Ixc from '../src/index';
import { verifyToken } from '../src/middleware/authMiddleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { IXC_API_URL, IXC_ADMIN_TOKEN, JWT_SECRET } = process.env;

if (!IXC_API_URL || !IXC_ADMIN_TOKEN || !JWT_SECRET) {
  throw new Error('Variáveis de ambiente IXC_API_URL, IXC_ADMIN_TOKEN, e JWT_SECRET devem ser definidas.');
}

const ixc = new Ixc({
  baseUrl: IXC_API_URL,
  token: IXC_ADMIN_TOKEN,
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // A API do IXC não tem um endpoint de autenticação padrão por senha no SDK.
    // Simulamos buscando o cliente pelo e-mail e validando.
    const clientes = await ixc.clientes.filtrarClientes({ hotsite_email: email });
    const cliente = clientes?.[0];

    // Simulação de verificação de senha. Em um caso real, isso seria uma hash.
    if (!cliente || password !== '123456') { // Usando senha fixa para demonstração
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: cliente.id, email: cliente.hotsite_email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro durante o login' });
  }
});

// --- Rotas Protegidas ---

// Dashboard
app.get('/api/dashboard', verifyToken, async (req: any, res) => {
  try {
    const clientId = req.user.id;
    const [clienteData, contratos] = await Promise.all([
      ixc.clientes.buscarClientesPorId(clientId),
      ixc.contratos.buscarContratosPorIdCliente(clientId),
    ]);

    const contratoPrincipal = contratos?.[0] || {};

    // Mock de dados não disponíveis no SDK
    const dashboardData = {
      cliente: {
        nome: clienteData.razao || 'Cliente Fiber.Net',
        endereco: `${clienteData.endereco}, ${clienteData.numero}` || 'Endereço não informado',
      },
      contrato: {
        plano: contratoPrincipal.descricao_aux_plano_venda || 'Plano Fibra',
        velocidade: '500 Mega', // Mock
        status: contratoPrincipal.status || 'A',
      },
      conexao: {
        online: true, // Mock
        ip: '177.85.12.34', // Mock
        uptime: '24d 10h 5m', // Mock
      },
      consumo: {
        total_download_bytes: 580 * 1024 * 1024 * 1024, // Mock 580GB
        total_upload_bytes: 290 * 1024 * 1024 * 1024, // Mock 290GB
        history: { // Mock
            daily: Array.from({ length: 7 }, (_, i) => ({ label: `Dia ${i+1}`, download: Math.random() * 15 + 5, upload: Math.random() * 8 + 1 })),
            weekly: Array.from({ length: 4 }, (_, i) => ({ label: `Sem ${i+1}`, download: Math.random() * 100 + 30, upload: Math.random() * 50 + 10 })),
            monthly: Array.from({ length: 6 }, (_, i) => ({ label: `Mês ${i+1}`, download: Math.random() * 400 + 150, upload: Math.random() * 200 + 40 })),
        },
      },
      faturas: [ // Mock de faturas
        { id: '123', vencimento: '10/08/2025', valor: '99.90', status: 'aberto', pix_code: '00020126...completo', linha_digitavel: '75691...', link_pdf: '#' },
        { id: '122', vencimento: '10/07/2025', valor: '99.90', status: 'pago', link_pdf: '#' },
      ],
      contratoPdf: `https://ixc.fibernettelecom.com/api/v1/get_contrato_pdf?id_contrato=${contratoPrincipal.id}`, // Mock
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha ao carregar dados do dashboard' });
  }
});

// Download de Boleto (Simulado)
app.get('/api/boleto/:id', verifyToken, (req, res) => {
    res.status(404).json({ error: 'Download de boleto ainda não implementado.' });
});

// Trocar Senha (Simulado)
app.post('/api/trocar-senha', verifyToken, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }
    // Lógica de troca de senha aqui...
    res.json({ message: 'Senha alterada com sucesso!' });
});


// Exporta o app para a Vercel
export default app;
