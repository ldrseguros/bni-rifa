import express, { Router } from "express";
import { login, cadastrar } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/cadastrar", cadastrar);

export default router;
