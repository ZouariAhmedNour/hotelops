/*
  Warnings:

  - You are about to drop the column `hotelId` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `MaintenanceCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "MaintenanceAttachment" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "photoType" TEXT;

-- AlterTable
ALTER TABLE "MaintenanceCategory" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "MaintenanceTicket" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "closureNote" TEXT,
ADD COLUMN     "needHelpReason" TEXT,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "pendingReason" TEXT,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resolutionNote" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "timeSpentMinutes" INTEGER,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedByUserId" INTEGER;

-- CreateTable
CREATE TABLE "MaintenanceTicketEvent" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" TEXT NOT NULL,
    "fromStatusId" INTEGER,
    "toStatusId" INTEGER,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceTicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceInterventionMaterial" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceInterventionMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSkill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MaintenanceSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceAgentProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "employeeCode" TEXT,
    "level" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "mainSpecialty" TEXT,
    "canHandleCritical" BOOLEAN NOT NULL DEFAULT false,
    "maxActiveTickets" INTEGER NOT NULL DEFAULT 5,
    "isOnCall" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceAgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceAgentSkill" (
    "id" SERIAL NOT NULL,
    "agentProfileId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MaintenanceAgentSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTeam_name_key" ON "MaintenanceTeam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTeam_code_key" ON "MaintenanceTeam"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSkill_name_key" ON "MaintenanceSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSkill_code_key" ON "MaintenanceSkill"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceAgentProfile_userId_key" ON "MaintenanceAgentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceAgentProfile_employeeCode_key" ON "MaintenanceAgentProfile"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceAgentSkill_agentProfileId_skillId_key" ON "MaintenanceAgentSkill"("agentProfileId", "skillId");

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicketEvent" ADD CONSTRAINT "MaintenanceTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MaintenanceTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicketEvent" ADD CONSTRAINT "MaintenanceTicketEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceInterventionMaterial" ADD CONSTRAINT "MaintenanceInterventionMaterial_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MaintenanceTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAgentProfile" ADD CONSTRAINT "MaintenanceAgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAgentProfile" ADD CONSTRAINT "MaintenanceAgentProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "MaintenanceTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAgentSkill" ADD CONSTRAINT "MaintenanceAgentSkill_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "MaintenanceAgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAgentSkill" ADD CONSTRAINT "MaintenanceAgentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "MaintenanceSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
