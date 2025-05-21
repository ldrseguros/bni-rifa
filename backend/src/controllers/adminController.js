import express from "express";
const { Request, Response } = express;
import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

export const getAllNumerosRifa = asyncHandler(async (req, res) => {
  try {
    const numeros = await prisma.numeroRifa.findMany();
    res.json(numeros);
  } catch (error) {
    console.error("Erro ao buscar números da rifa:", error);
    res.status(500).json({ message: "Erro ao buscar números da rifa." });
  }
});

export const confirmarPagamento = asyncHandler(async (req, res) => {
  const numeroId = parseInt(req.params.id, 10);

  if (isNaN(numeroId)) {
    return res.status(400).json({ message: "ID do número inválido." });
  }

  try {
    const numeroAtualizado = await prisma.numeroRifa.update({
      where: { numero: numeroId },
      data: { status: "confirmado" },
    });

    res.json(numeroAtualizado);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Número da rifa não encontrado." });
      }
    }
    console.error("Erro ao confirmar pagamento:", error);
    res.status(500).json({ message: "Erro ao confirmar pagamento." });
  }
});

export const estornarNumero = asyncHandler(async (req, res) => {
  const numeroId = parseInt(req.params.id, 10);

  if (isNaN(numeroId)) {
    return res.status(400).json({ message: "ID do número inválido." });
  }

  try {
    const numeroAtualizado = await prisma.numeroRifa.update({
      where: { numero: numeroId },
      data: {
        status: "disponivel",
        nome: null,
        email: null,
        telefone: null,
        dataReserva: null,
      },
    });

    res.json(numeroAtualizado);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Número da rifa não encontrado." });
      }
    }
    console.error("Erro ao estornar número:", error);
    res.status(500).json({ message: "Erro ao estornar número." });
  }
});

export const ativarMaisNumeros = asyncHandler(async (req, res) => {
  try {
    // Verificar se os números de 301 a 500 já existem
    const numerosExistentes = await prisma.numeroRifa.findMany({
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
    });

    console.log(
      `Encontrados ${numerosExistentes.length} números existentes na faixa 301-500.`
    );

    // Se existirem, atualizar para "disponivel"
    if (numerosExistentes.length > 0) {
      const updateResult = await prisma.numeroRifa.updateMany({
        where: {
          numero: {
            gte: 301,
            lte: 500,
          },
        },
        data: {
          status: "disponivel",
        },
      });

      console.log(
        `Atualizados ${updateResult.count} números para "disponivel".`
      );
    }

    // Criar os números que não existem
    const numerosExistentesIds = numerosExistentes.map((n) => n.numero);
    const numerosParaCriar = [];

    for (let i = 301; i <= 500; i++) {
      if (!numerosExistentesIds.includes(i)) {
        numerosParaCriar.push({
          numero: i,
          status: "disponivel", // Novos números começam como disponiveis
        });
      }
    }

    // Se houver números para criar, criá-los
    let createResult = { count: 0 };
    if (numerosParaCriar.length > 0) {
      console.log(`Criando ${numerosParaCriar.length} novos números...`);

      // Usar createMany para inserir múltiplos registros de uma vez
      createResult = await prisma.numeroRifa.createMany({
        data: numerosParaCriar,
        skipDuplicates: true, // Ignorar se o número já existir
      });

      console.log(`Criados ${createResult.count} novos números.`);
    }

    // Verificar novamente o status após as operações
    const statusCheck = await prisma.numeroRifa.groupBy({
      by: ["status"],
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
      _count: {
        status: true,
      },
    });

    console.log("Status atual dos números 301-500:", statusCheck);

    // Resposta mais informativa
    res.json({
      message: `Números extras ativados. Atualizados: ${numerosExistentes.length}, Criados: ${createResult.count}`,
      detalhes: {
        atualizados: numerosExistentes.length,
        criados: createResult.count,
        statusAtual: statusCheck,
      },
    });
  } catch (error) {
    console.error("Erro ao ativar mais números:", error);
    res.status(500).json({ message: "Erro ao ativar mais números." });
  }
});

export const desativarNumerosExtras = asyncHandler(async (req, res) => {
  try {
    console.log("Iniciando desativação dos números extras (301-500)...");

    // Verificar quantos números existem na faixa 301-500
    const numerosExistentes = await prisma.numeroRifa.count({
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
    });

    console.log(`Encontrados ${numerosExistentes} números na faixa 301-500.`);

    // Verificar status atual antes da atualização
    const statusAntes = await prisma.numeroRifa.groupBy({
      by: ["status"],
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
      _count: {
        status: true,
      },
    });

    console.log("Status antes da atualização:", statusAntes);

    // Atualizar todos os números de 301 a 500 para status "indisponivel"
    // Não vamos deletar os registros, apenas desativar para preservar qualquer histórico
    const resultado = await prisma.numeroRifa.updateMany({
      where: {
        numero: {
          gte: 301, // greater than or equal
          lte: 500, // less than or equal
        },
      },
      data: {
        status: "indisponivel",
        // Manter os dados de proprietário se estiver confirmado o pagamento
        // Se precisar limpar todos os dados, descomentar as linhas abaixo
        /* 
        nome: null,
        email: null,
        telefone: null,
        dataReserva: null
        */
      },
    });

    console.log(`Atualizados ${resultado.count} números para "indisponivel".`);

    // Verificar status após a atualização
    const statusDepois = await prisma.numeroRifa.groupBy({
      by: ["status"],
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
      _count: {
        status: true,
      },
    });

    console.log("Status após a atualização:", statusDepois);

    res.json({
      message: `Foram desativados ${resultado.count} números extras (301 a 500).`,
      detalhes: {
        total: numerosExistentes,
        atualizados: resultado.count,
        statusAntes: statusAntes,
        statusAtual: statusDepois,
      },
    });
  } catch (error) {
    console.error("Erro ao desativar números extras:", error);
    res.status(500).json({ message: "Erro ao desativar números extras." });
  }
});
