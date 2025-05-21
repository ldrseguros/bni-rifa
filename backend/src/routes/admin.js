import express from "express";
const { Router, Request, Response } = express;
import {
  getAllNumerosRifa,
  confirmarPagamento,
  estornarNumero,
  ativarMaisNumeros,
  desativarNumerosExtras,
} from "../controllers/adminController.js";

const router = Router();

// Rota de teste protegida
router.get("/dashboard", (req, res) => {
  // Esta rota só será acessível se o authenticateToken middleware for bem-sucedido
  res.json({
    message: "Bem-vindo ao painel administrativo!",
    user: req.user,
  });
});

// Nova rota para listar todos os números da rifa
router.get("/numeros", getAllNumerosRifa);

// Rota para confirmar pagamento de um número
router.patch("/numeros/:id/confirmar-pagamento", confirmarPagamento);

// Rota para estornar um número
router.patch("/numeros/:id/estornar", estornarNumero);

// Rota para ativar mais números (301 a 500)
router.post("/numeros/ativar-mais", ativarMaisNumeros);

// Rota para desativar números extras (301 a 500)
router.post("/numeros/desativar-extras", desativarNumerosExtras);

export default router;
