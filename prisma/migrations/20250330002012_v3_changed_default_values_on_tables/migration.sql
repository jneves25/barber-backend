-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_settingsId_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "settingsId" DROP NOT NULL,
ALTER COLUMN "logo" DROP NOT NULL,
ALTER COLUMN "backgroundImage" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "whatsapp" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CompanySettings" ALTER COLUMN "appointmentIntervalMinutes" SET DEFAULT 30,
ALTER COLUMN "advanceNoticeDays" SET DEFAULT 1,
ALTER COLUMN "preparationTimeMinutes" SET DEFAULT 15,
ALTER COLUMN "sendReminderWhatsApp" SET DEFAULT true,
ALTER COLUMN "confirmAppointmentWhatsApp" SET DEFAULT true,
ALTER COLUMN "notifyBarberNewAppointments" SET DEFAULT true,
ALTER COLUMN "acceptedPaymentMethods" SET DEFAULT '[]',
ALTER COLUMN "commissionPercentage" SET DEFAULT 10.0,
ALTER COLUMN "commissionPaymentFrequency" SET DEFAULT 'quinzenal',
ALTER COLUMN "allowEarlyPaymentOnline" SET DEFAULT false,
ALTER COLUMN "requireDepositConfirmation" SET DEFAULT true,
ALTER COLUMN "applyDiscountForCashPayment" SET DEFAULT true;

-- AlterTable
ALTER TABLE "WorkingHours" ALTER COLUMN "mondayOpen" SET DEFAULT '08:00',
ALTER COLUMN "mondayClose" SET DEFAULT '18:00',
ALTER COLUMN "tuesdayOpen" SET DEFAULT '08:00',
ALTER COLUMN "tuesdayClose" SET DEFAULT '18:00',
ALTER COLUMN "wednesdayOpen" SET DEFAULT '08:00',
ALTER COLUMN "wednesdayClose" SET DEFAULT '18:00',
ALTER COLUMN "thursdayOpen" SET DEFAULT '08:00',
ALTER COLUMN "thursdayClose" SET DEFAULT '18:00',
ALTER COLUMN "fridayOpen" SET DEFAULT '08:00',
ALTER COLUMN "fridayClose" SET DEFAULT '18:00',
ALTER COLUMN "saturdayOpen" SET DEFAULT '08:00',
ALTER COLUMN "saturdayClose" SET DEFAULT '18:00',
ALTER COLUMN "sundayOpen" SET DEFAULT '08:00',
ALTER COLUMN "sundayClose" SET DEFAULT '18:00';

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "CompanySettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
