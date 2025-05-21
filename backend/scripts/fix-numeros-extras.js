import { PrismaClient } from "@prisma/client";

// Script para corrigir os números extras da rifa (301-500)
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\nAtualizando números extras (301-500) para 'disponivel'...");

    // Atualizar todos os números de 301 a 500 para status "disponivel"
    const result = await prisma.numeroRifa.updateMany({
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
        // Opcionalmente, podemos adicionar um filtro adicional para atualizar
        // apenas os números com status "indisponivel"
        status: "indisponivel",
      },
      data: {
        status: "disponivel",
      },
    });

    console.log(
      `\nForam atualizados ${result.count} números para status 'disponivel'.\n`
    );

    // Verificar o status atual
    const disponiveisCount = await prisma.numeroRifa.count({
      where: {
        status: "disponivel",
        numero: {
          gte: 301,
          lte: 500,
        },
      },
    });

    const indisponiveisCount = await prisma.numeroRifa.count({
      where: {
        status: "indisponivel",
        numero: {
          gte: 301,
          lte: 500,
        },
      },
    });

    console.log(`Status atual dos números extras (301-500):`);
    console.log(`- Disponíveis: ${disponiveisCount}`);
    console.log(`- Indisponíveis: ${indisponiveisCount}\n`);
  } catch (error) {
    console.error("Erro ao atualizar números extras:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
