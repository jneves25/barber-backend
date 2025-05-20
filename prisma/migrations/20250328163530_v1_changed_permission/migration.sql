/*
  Warnings:

  - You are about to drop the column `role` on the `CompanyMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'nome';

-- AlterTable
ALTER TABLE "CompanyMember" DROP COLUMN "role";
