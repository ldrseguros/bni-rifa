// Script para preparar o deploy do frontend
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Função principal
async function main() {
  try {
    console.log("\n=== Preparando o frontend para deploy ===\n");

    // 1. Verificar se o arquivo .env.production existe
    console.log("1. Verificando arquivos de ambiente...");
    const envProdPath = path.join(rootDir, ".env.production");
    const envExamplePath = path.join(rootDir, ".env.example");

    if (!fs.existsSync(envProdPath)) {
      console.log("⚠️ Arquivo .env.production não encontrado!");

      // Criar arquivo .env.example para referência
      const envExampleContent = `# URL da API de backend em produção
VITE_API_URL=https://sua-api-backend.com
`;
      if (!fs.existsSync(envExamplePath)) {
        fs.writeFileSync(envExamplePath, envExampleContent);
        console.log("✅ Arquivo .env.example criado para referência.");
      }

      console.log(
        "   Para deploy, crie um arquivo .env.production com a URL do backend."
      );
    } else {
      console.log("✅ Arquivo .env.production encontrado!");
    }

    // 2. Verificar o script de build
    console.log("\n2. Verificando o script de build...");
    const packageJsonPath = path.join(rootDir, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      if (packageJson.scripts && packageJson.scripts.build) {
        console.log("✅ Script de build encontrado!");
      } else {
        console.log("⚠️ Script de build não encontrado no package.json!");
        console.log('   Adicione o script: "build": "vite build"');
      }
    } else {
      console.log("❌ package.json não encontrado!");
    }

    // 3. Instruções para deploy
    console.log("\n=== Instruções para Deploy do Frontend ===");
    console.log(`
Para fazer o deploy do frontend:

1. Prepare o frontend para produção:
   $ npm run build
   
   Isso criará uma pasta 'dist' com os arquivos estáticos otimizados.

2. Plataformas recomendadas para deploy:
   - Vercel: https://vercel.com (recomendada, possui plano gratuito)
   - Netlify: https://netlify.com (possui plano gratuito)
   - GitHub Pages: https://pages.github.com (gratuito)
   - Hostinger: https://hostinger.com.br (opção comercial)

3. Configurações importantes:
   - Configure a variável de ambiente VITE_API_URL para apontar para a URL do seu backend em produção
   - Para Vercel/Netlify, configure as rotas para redirecionar todas as requisições para index.html
   - Exemplo de arquivo vercel.json:
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }

4. Certifique-se que o backend está configurado com CORS para aceitar requisições do seu domínio frontend:
   Exemplo (no backend):
   app.use(cors({
     origin: ["https://seu-site-frontend.com", "http://localhost:5173"]
   }));

Lembre-se de testar o deploy em um ambiente de staging antes de ir para produção.
    `);

    console.log("\n=== Verificação concluída ===\n");
  } catch (error) {
    console.error("Erro durante a verificação:", error);
  }
}

main();
