-- CreateEnum
CREATE TYPE "CommissionRuleTypeEnum" AS ENUM ('MONEY', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "CommissionRule" ADD COLUMN     "serviceType" "CommissionRuleTypeEnum" NOT NULL DEFAULT 'PERCENTAGE';
