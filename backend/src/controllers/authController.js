import express from "express";
const { Request, Response } = express;
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Definindo uma chave padrão para ser usada quando a variável de ambiente não estiver disponível
const JWT_SECRET =
  process.env.SEGREDO_DO_JWT ||
  "c78f62f0535b9531033d64842f9cb9ce61b2a69f8551ac7381ae3823da529b14";

console.log("--- Antes de criar PrismaClient ---");
const prisma = new PrismaClient();

export const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1. Buscar o usuário administrador pelo email
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 2. Comparar a senha fornecida com o hash armazenado
    const senhaValida = await bcrypt.compare(senha, adminUser.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 3. Gerar um token JWT
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: "24h" } // Aumentando o tempo de expiração para 24 horas
    );

    // 4. Enviar o token na resposta
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

export const cadastrar = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ message: "E-mail e senha são obrigatórios." });
  }

  try {
    // Verificar se já existe um usuário com este email
    const usuarioExistente = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ message: "Este e-mail já está em uso." });
    }

    // Gerar o hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar o novo usuário administrador
    const novoUsuario = await prisma.adminUser.create({
      data: {
        email,
        senha: senhaHash,
      },
    });

    // Gerar token JWT para o novo usuário
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email },
      JWT_SECRET,
      { expiresIn: "24h" } // Aumentando o tempo de expiração para 24 horas
    );

    // Enviar resposta com token
    res.status(201).json({
      message: "Administrador cadastrado com sucesso!",
      token,
    });
  } catch (error) {
    console.error("Erro ao cadastrar administrador:", error);
    res.status(500).json({ message: "Erro ao cadastrar administrador." });
  }
});
