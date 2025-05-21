import express from "express";
const { Request, Response } = express;
import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Função para obter todos os números da rifa para exibição pública
export const getNumerosRifaPublic = asyncHandler(async (req, res) => {
  try {
    // Buscar todos os números, selecionando apenas o número e o status
    const numeros = await prisma.numeroRifa.findMany({
      select: {
        numero: true,
        status: true,
      },
    });

    res.json(numeros);
  } catch (error) {
    // Tipo 'unknown' por padrão
    console.error("Erro ao buscar números da rifa para público:", error);
    res.status(500).json({ message: "Erro ao buscar números da rifa." });
  }
});

// Função para reservar um número da rifa
export const reservarNumero = asyncHandler(async (req, res) => {
  const { numero, nome, email, telefone } = req.body;

  // Validação básica de entrada
  if (!numero || !nome || !email || !telefone) {
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }

  // Converter número para inteiro e validar
  const numeroRifa = parseInt(numero, 10);
  if (isNaN(numeroRifa)) {
    return res.status(400).json({ message: "Número da rifa inválido." });
  }

  try {
    // Tentar atualizar o número SOMENTE SE ele estiver disponivel
    const numeroReservado = await prisma.numeroRifa.update({
      where: {
        numero: numeroRifa,
        status: "disponivel", // Condição para garantir que só reservamos números disponiveis
      },
      data: {
        status: "reservado",
        nome: nome,
        email: email,
        telefone: telefone,
        dataReserva: new Date(),
      },
    });

    res.status(200).json(numeroReservado); // Sucesso na reserva
  } catch (error) {
    // Tipo 'unknown' por padrão
    // Verificação para erro de registro não encontrado (P2025) ou condição não satisfeita
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        // Registro não encontrado ou condição não satisfeita
        // Podemos verificar se o número existe, mas já está reservado/confirmado
        const numeroExistente = await prisma.numeroRifa.findUnique({
          where: { numero: numeroRifa },
          select: { status: true },
        });

        if (numeroExistente) {
          if (numeroExistente.status !== "disponivel") {
            return res.status(409).json({
              message: "Este número já foi reservado ou confirmado.",
            });
          } else {
            // Deveria ser disponivel mas P2025 ocorreu, erro inesperado
            console.error(
              "Erro P2025 inesperado para número disponivel:",
              error
            );
            return res.status(500).json({
              message: "Erro inesperado ao tentar reservar o número.",
            });
          }
        } else {
          // Número não encontrado
          return res
            .status(404)
            .json({ message: "Número da rifa não encontrado." });
        }
      }
      // Outros erros conhecidos do Prisma podem ser tratados aqui se necessário
    }

    // Erro genérico
    console.error("Erro ao reservar número:", error);
    res.status(500).json({ message: "Erro ao reservar número." });
  }
});
