/*
  Warnings:

  - You are about to drop the column `createCompany` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "createCompany",
ADD COLUMN     "manageCompany" BOOLEAN NOT NULL DEFAULT false;
