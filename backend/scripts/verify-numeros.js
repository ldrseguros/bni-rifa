import { PrismaClient } from "@prisma/client";

// Script para verificar números da rifa
const prisma = new PrismaClient();

async function main() {
  try {
    // Total de números no banco
    const numeroCount = await prisma.numeroRifa.count();
    console.log(`\nTotal de números no banco de dados: ${numeroCount}`);

    // Verificar números de 1 a 300
    const numeros1a300Count = await prisma.numeroRifa.count({
      where: {
        numero: {
          gte: 1,
          lte: 300,
        },
      },
    });
    console.log(`Números de 1 a 300: ${numeros1a300Count}`);

    // Verificar números de 301 a 500
    const numeros301a500Count = await prisma.numeroRifa.count({
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
    });
    console.log(`Números de 301 a 500: ${numeros301a500Count}`);

    // Verificar por status
    const disponiveisCount = await prisma.numeroRifa.count({
      where: { status: "disponivel" },
    });
    console.log(`Números disponíveis: ${disponiveisCount}`);

    const reservadosCount = await prisma.numeroRifa.count({
      where: { status: "reservado" },
    });
    console.log(`Números reservados: ${reservadosCount}`);

    const confirmadosCount = await prisma.numeroRifa.count({
      where: { status: "confirmado" },
    });
    console.log(`Números confirmados: ${confirmadosCount}`);

    const indisponiveisCount = await prisma.numeroRifa.count({
      where: { status: "indisponivel" },
    });
    console.log(`Números indisponíveis: ${indisponiveisCount}`);

    // Verificar faltantes na faixa de 301-500
    const numeros301a500 = await prisma.numeroRifa.findMany({
      where: {
        numero: {
          gte: 301,
          lte: 500,
        },
      },
      orderBy: {
        numero: "asc",
      },
    });

    const listaNumeros = numeros301a500.map((n) => n.numero);
    console.log(
      `\nNúmeros presentes na faixa 301-500: ${
        listaNumeros.length > 0 ? listaNumeros.join(", ") : "nenhum"
      }`
    );

    // Verificar números faltantes na faixa 301-500
    const numerosFaltantes = [];
    for (let i = 301; i <= 500; i++) {
      if (!listaNumeros.includes(i)) {
        numerosFaltantes.push(i);
      }
    }

    console.log(
      `\nNúmeros faltantes na faixa 301-500: ${
        numerosFaltantes.length > 0 ? numerosFaltantes.join(", ") : "nenhum"
      }\n`
    );
  } catch (error) {
    console.error("Erro ao verificar números da rifa:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
