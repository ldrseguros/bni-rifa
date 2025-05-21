-- CreateTable
CREATE TABLE "NumeroRifa" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "nome" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "dataReserva" TIMESTAMP(3),

    CONSTRAINT "NumeroRifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NumeroRifa_numero_key" ON "NumeroRifa"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
