/*
  Warnings:

  - Added the required column `viewFullStatistics` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viewOwnStatistics` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "viewFullStatistics" BOOLEAN NOT NULL,
ADD COLUMN     "viewOwnStatistics" BOOLEAN NOT NULL;
