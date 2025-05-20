-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('ADMIN', 'USER', 'MANAGER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleEnum" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "CompanyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createCompany" BOOLEAN NOT NULL,
    "viewCompanys" BOOLEAN NOT NULL,
    "addMember" BOOLEAN NOT NULL,
    "managePermissions" BOOLEAN NOT NULL,
    "viewPermissions" BOOLEAN NOT NULL,
    "viewAllAppointments" BOOLEAN NOT NULL,
    "manageAppointments" BOOLEAN NOT NULL,
    "viewOwnAppointments" BOOLEAN NOT NULL,
    "viewAllClients" BOOLEAN NOT NULL,
    "manageClients" BOOLEAN NOT NULL,
    "viewOwnClients" BOOLEAN NOT NULL,
    "viewAllServices" BOOLEAN NOT NULL,
    "manageServices" BOOLEAN NOT NULL,
    "viewServices" BOOLEAN NOT NULL,
    "viewAllProducts" BOOLEAN NOT NULL,
    "manageProducts" BOOLEAN NOT NULL,
    "viewProducts" BOOLEAN NOT NULL,
    "viewAllBarbers" BOOLEAN NOT NULL,
    "manageBarbers" BOOLEAN NOT NULL,
    "viewAllCommissions" BOOLEAN NOT NULL,
    "manageCommissions" BOOLEAN NOT NULL,
    "viewOwnCommissions" BOOLEAN NOT NULL,
    "viewAllGoals" BOOLEAN NOT NULL,
    "manageGoals" BOOLEAN NOT NULL,
    "viewOwnGoals" BOOLEAN NOT NULL,
    "viewFullRevenue" BOOLEAN NOT NULL,
    "viewOwnRevenue" BOOLEAN NOT NULL,
    "manageSettings" BOOLEAN NOT NULL,
    "viewUsers" BOOLEAN NOT NULL,
    "manageUsers" BOOLEAN NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_key" ON "Company"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_CompanyId_userId_key" ON "CompanyMember"("CompanyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userId_key" ON "Permission"("userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_CompanyId_fkey" FOREIGN KEY ("CompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
