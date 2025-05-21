import express from "express";
const { Router } = express;
import {
  getNumerosRifaPublic,
  reservarNumero,
} from "../controllers/userController.js"; // Importando o controller

const router = Router();

// Rota para obter todos os números da rifa para exibição pública
router.get("/numeros", getNumerosRifaPublic);

// Rota para reservar um número da rifa
router.post("/reservar-numero", reservarNumero);

export default router;
