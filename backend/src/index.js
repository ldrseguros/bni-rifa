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
    origin: function (origin, callback) {
      // Permitir requisições sem origin (como mobile apps ou ferramentas de API)
      if (!origin) return callback(null, true);

      // Lista de origens permitidas sem a barra final
      const allowedOrigins = [
        "https://bni-rifa.vercel.app",
        "http://localhost:5173",
        "http://localhost:8080",
      ];

      // Verificar origem normalizando - removendo qualquer barra final
      const normalizedOrigin = origin.endsWith("/")
        ? origin.slice(0, -1)
        : origin;

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Não permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
