-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "sourceRegister" INTEGER;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_sourceRegister_fkey" FOREIGN KEY ("sourceRegister") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
