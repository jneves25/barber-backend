/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyMember" DROP CONSTRAINT "CompanyMember_CompanyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyMember" DROP CONSTRAINT "CompanyMember_userId_fkey";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "CompanyMember";

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'nome',
    "ownerId" INTEGER NOT NULL,
    "settingsId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "backgroundImage" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "appointmentIntervalMinutes" INTEGER NOT NULL,
    "advanceNoticeDays" INTEGER NOT NULL,
    "preparationTimeMinutes" INTEGER NOT NULL,
    "sendReminderWhatsApp" BOOLEAN NOT NULL,
    "confirmAppointmentWhatsApp" BOOLEAN NOT NULL,
    "notifyBarberNewAppointments" BOOLEAN NOT NULL,
    "acceptedPaymentMethods" TEXT NOT NULL,
    "commissionPercentage" DOUBLE PRECISION NOT NULL,
    "commissionPaymentFrequency" TEXT NOT NULL,
    "allowEarlyPaymentOnline" BOOLEAN NOT NULL,
    "requireDepositConfirmation" BOOLEAN NOT NULL,
    "applyDiscountForCashPayment" BOOLEAN NOT NULL,
    "workingHoursId" INTEGER NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHours" (
    "id" SERIAL NOT NULL,
    "mondayOpen" TEXT NOT NULL,
    "mondayClose" TEXT NOT NULL,
    "tuesdayOpen" TEXT NOT NULL,
    "tuesdayClose" TEXT NOT NULL,
    "wednesdayOpen" TEXT NOT NULL,
    "wednesdayClose" TEXT NOT NULL,
    "thursdayOpen" TEXT NOT NULL,
    "thursdayClose" TEXT NOT NULL,
    "fridayOpen" TEXT NOT NULL,
    "fridayClose" TEXT NOT NULL,
    "saturdayOpen" TEXT NOT NULL,
    "saturdayClose" TEXT NOT NULL,
    "sundayOpen" TEXT NOT NULL,
    "sundayClose" TEXT NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_key" ON "Company"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_settingsId_key" ON "Company"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_companyId_key" ON "CompanySettings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_workingHoursId_key" ON "CompanySettings"("workingHoursId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "CompanySettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySettings" ADD CONSTRAINT "CompanySettings_workingHoursId_fkey" FOREIGN KEY ("workingHoursId") REFERENCES "WorkingHours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
