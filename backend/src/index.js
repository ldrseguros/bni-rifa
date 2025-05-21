import express from "express";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://bni-rifa.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para processar JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend da Rifa Online está rodando!");
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Rotas do painel administrativo
app.use("/admin", authenticateToken, adminRoutes);

// Rotas do usuário comum
app.use("/api", userRoutes);

app
  .listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  })
  .on("error", (err) => {
    console.error("Erro ao iniciar o servidor:", err);
  });
