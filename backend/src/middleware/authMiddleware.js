import express from "express";
const { Request, Response, NextFunction } = express;
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Definindo uma chave padrão para ser usada quando a variável de ambiente não estiver disponível
const JWT_SECRET =
  process.env.SEGREDO_DO_JWT ||
  "c78f62f0535b9531033d64842f9cb9ce61b2a69f8551ac7381ae3823da529b14";

export const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.sendStatus(401); // Se não houver token, retorne 401 Não Autorizado
    return;
  }

  try {
    // Usando a chave padrão definida acima
    const decoded = jwt.verify(token, JWT_SECRET);

    // Anexar as informações do usuário ao objeto de requisição
    req.user = decoded;
    next(); // Continue para a próxima middleware ou rota
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.sendStatus(403); // Se o token não for válido, retorne 403 Proibido
  }
});
