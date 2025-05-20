-- CreateEnum
CREATE TYPE "CommissionTypeEnum" AS ENUM ('GENERAL', 'SERVICES');

-- CreateEnum
CREATE TYPE "CommissionModeEnum" AS ENUM ('FIXED', 'DIVERSE');

-- CreateTable
CREATE TABLE "CommissionConfig" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "commissionType" "CommissionTypeEnum" NOT NULL,
    "commissionMode" "CommissionModeEnum" NOT NULL,
    "commissionValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" SERIAL NOT NULL,
    "configId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRule" ADD CONSTRAINT "CommissionRule_configId_fkey" FOREIGN KEY ("configId") REFERENCES "CommissionConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
