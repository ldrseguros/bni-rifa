import { PrismaClient } from "@prisma/client";

// Script para inicializar números da rifa
const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar quantos números existem no banco de dados
    const numeroCount = await prisma.numeroRifa.count();

    if (numeroCount === 0) {
      console.log("\nInicializando números da rifa...");

      // Vamos criar números de 1 a 300 inicialmente
      const numerosParaCriar = [];
      for (let i = 1; i <= 300; i++) {
        numerosParaCriar.push({
          numero: i,
          status: "disponivel",
        });
      }

      // Usando createMany para inserir múltiplos registros de uma vez
      const result = await prisma.numeroRifa.createMany({
        data: numerosParaCriar,
        skipDuplicates: true,
      });

      console.log(
        `\nForam criados ${result.count} números de rifa (1 a 300).\n`
      );
    } else {
      console.log(
        `\nJá existem ${numeroCount} números de rifa no banco de dados.\n`
      );
    }
  } catch (error) {
    console.error("Erro ao inicializar números da rifa:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
