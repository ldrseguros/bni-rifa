// Script para preparar o deploy
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n=== Preparando o backend para deploy ===\n");

    // 1. Verificar as migrações do Prisma
    console.log("1. Verificando as migrações do Prisma...");
    if (!fs.existsSync(path.join(process.cwd(), "prisma/migrations"))) {
      console.log(
        "⚠️ Nenhuma migração encontrada! Você precisa criar migrações antes do deploy."
      );
      console.log("   Execute: npx prisma migrate dev --name initial");
    } else {
      console.log("✅ Migrações encontradas!");
    }

    // 2. Verificando variáveis de ambiente
    console.log("\n2. Verificando variáveis de ambiente...");
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
    let missingVars = [];

    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    });

    if (missingVars.length > 0) {
      console.log(
        `⚠️ Variáveis de ambiente necessárias estão faltando: ${missingVars.join(
          ", "
        )}`
      );
      console.log(
        "   Crie um arquivo .env com essas variáveis antes do deploy."
      );

      // Criar arquivo .env.example se não existir
      if (!fs.existsSync(path.join(process.cwd(), ".env.example"))) {
        const envExampleContent = `# Configuração do Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/rifa_db?schema=public"

# Configuração do JWT
JWT_SECRET="sua_chave_secreta_muito_longa_e_complexa"

# Porta do servidor (opcional)
PORT=3000`;

        fs.writeFileSync(
          path.join(process.cwd(), ".env.example"),
          envExampleContent
        );
        console.log("   Arquivo .env.example criado para referência.");
      }
    } else {
      console.log("✅ Variáveis de ambiente configuradas!");
    }

    // 3. Verificar a conexão com o banco de dados
    console.log("\n3. Verificando conexão com o banco de dados...");
    try {
      await prisma.$connect();
      console.log("✅ Conexão com o banco de dados estabelecida!");

      // Verificar os números da rifa
      const numeroCount = await prisma.numeroRifa.count();
      console.log(`   Total de números no banco de dados: ${numeroCount}`);

      if (numeroCount === 0) {
        console.log("⚠️ Nenhum número encontrado no banco de dados!");
        console.log("   Execute: npm run setup-numeros");
      }
    } catch (error) {
      console.log("❌ Erro ao conectar ao banco de dados:");
      console.error(error);
    }

    // 4. Verificar as dependências
    console.log("\n4. Verificando dependências...");
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );
    const hasPrismaClient =
      packageJson.dependencies && packageJson.dependencies["@prisma/client"];

    if (!hasPrismaClient) {
      console.log("⚠️ @prisma/client não encontrado nas dependências!");
      console.log("   Execute: npm install @prisma/client");
    } else {
      console.log("✅ Dependências verificadas!");
    }

    // 5. Instruções para deploy
    console.log("\n=== Instruções para Deploy ===");
    console.log(`
Para fazer o deploy do backend:

1. Plataformas recomendadas:
   - Render: https://render.com (possui plano gratuito)
   - Railway: https://railway.app
   - Vercel: https://vercel.com (para o frontend)
   - Hostinger: https://hostinger.com.br (opção comercial)

2. Prepare o código para deploy:
   - Adicione todas as variáveis de ambiente na plataforma escolhida
   - Configure o banco de dados PostgreSQL na plataforma ou use um serviço como:
     * ElephantSQL (https://www.elephantsql.com) - possui plano gratuito
     * Neon (https://neon.tech) - possui plano gratuito
     * Supabase (https://supabase.com) - possui plano gratuito

3. Comando para executar após o deploy:
   - npx prisma migrate deploy
   - node scripts/setup-numeros.js (se necessário)
   - npm start

Para mais informações, consulte a documentação do Prisma sobre deploy:
https://www.prisma.io/docs/orm/prisma-client/deployment
    `);

    console.log("\n=== Verificação concluída ===\n");
  } catch (error) {
    console.error("Erro durante a verificação:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
