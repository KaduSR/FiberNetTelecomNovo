// src/controllers/dashboardController.js
const IXCService = require("../services/ixc");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

/**
 * Verifica se a variável de ambiente JWT_SECRET está definida.
 * @param {import('express').Response} res - O objeto de resposta do Express.
 * @returns {boolean} - Retorna true se a chave secreta existir, caso contrário, false.
 */
const checkJwtSecret = (res) => {
  if (!process.env.JWT_SECRET) {
    console.error(
      "[AUTH ERROR] A variável de ambiente JWT_SECRET não está definida."
    );
    res
      .status(500)
      .json({ error: "Erro de configuração interna do servidor." });
    return false;
  }
  return true;
};

exports.getDashboardData = async (req, res) => {
  try {
    if (!checkJwtSecret(res)) return;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token ausente" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clienteId = decoded.id;

    // Busca todos os dados em paralelo
    const [clienteRaw, contrato, consumo, faturas] = await Promise.all([
      IXCService.list("cliente", {
        qtype: "cliente.id",
        query: clienteId,
        oper: "=",
        limit: 1,
      }),
      IXCService.getContractDetails(clienteId),
      IXCService.getConsumption(clienteId),
      IXCService.getFaturas(clienteId),
    ]);

    const cliente = clienteRaw.registros?.[0] || {};

    res.json({
      cliente: {
        nome: cliente.razao || "Cliente",
        email: cliente.hotsite_email || decoded.email,
        cpf_cnpj: cliente.cnpj_cpf || "Não informado",
      },
      plano: {
        velocidade: contrato.plan_speed || "Não informado",
        status: contrato.status || "Desconhecido",
        endereco:
          cliente.endereco_instalacao || cliente.endereco || "Não informado",
      },
      consumo: {
        download: consumo.download || "0 GB",
        upload: consumo.upload || "0 GB",
      },
      faturas: faturas, // O serviço já retorna um array vazio se não houver faturas
      contratoPdf: contrato.contract_id
        ? IXCService.getContractPdfUrl(contrato.contract_id)
        : null,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    console.error("[Dashboard] Erro:", error.message);
    res.status(500).json({ error: "Erro ao carregar dados" });
  }
};

// NOVA ROTA: Trocar senha do hotsite
exports.trocarSenha = async (req, res) => {
  try {
    if (!checkJwtSecret(res)) return;

    const token = req.headers.authorization?.split(" ")[1];
    const { senhaAtual, novaSenha } = req.body;

    if (!token || !senhaAtual || !novaSenha) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clienteId = decoded.id;

    // Verifica senha atual usando o método centralizado no serviço
    const senhaCorreta = await IXCService.verifyPassword(clienteId, senhaAtual);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    // Atualiza senha (força MD5 para compatibilidade)
    const resultado = await IXCService.post(
      "cliente",
      {
        id: clienteId,
        senha: md5(novaSenha),
        senha_hotsite_md5: "S",
      },
      "editar"
    );

    if (resultado.error) {
      console.error("[Trocar Senha] Erro IXC:", resultado.message);
      return res.status(500).json({ error: "Erro ao salvar nova senha no IXC" });
    }

    res.json({ success: true, message: "Senha alterada com sucesso!" });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    console.error("[Trocar Senha] Erro:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
