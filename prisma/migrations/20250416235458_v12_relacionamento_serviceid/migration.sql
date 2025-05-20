/*
  Warnings:

  - You are about to drop the column `serviceType` on the `CommissionRule` table. All the data in the column will be lost.
  - Added the required column `serviceId` to the `CommissionRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommissionRule" DROP COLUMN "serviceType",
ADD COLUMN     "serviceId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "CommissionRule_configId_idx" ON "CommissionRule"("configId");

-- CreateIndex
CREATE INDEX "CommissionRule_serviceId_idx" ON "CommissionRule"("serviceId");

-- AddForeignKey
ALTER TABLE "CommissionRule" ADD CONSTRAINT "CommissionRule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
