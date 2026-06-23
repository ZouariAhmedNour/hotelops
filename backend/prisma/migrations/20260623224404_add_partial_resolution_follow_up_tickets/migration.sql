-- AlterTable
ALTER TABLE "MaintenanceTicket" ADD COLUMN     "followUpCreatedAt" TIMESTAMP(3),
ADD COLUMN     "followUpReason" TEXT,
ADD COLUMN     "parentTicketId" INTEGER,
ADD COLUMN     "recommendedSpecialty" TEXT,
ADD COLUMN     "requiresExpertIntervention" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "temporaryFixNote" TEXT;

-- CreateIndex
CREATE INDEX "MaintenanceTicket_parentTicketId_idx" ON "MaintenanceTicket"("parentTicketId");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_requiresExpertIntervention_idx" ON "MaintenanceTicket"("requiresExpertIntervention");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_followUpCreatedAt_idx" ON "MaintenanceTicket"("followUpCreatedAt");

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_parentTicketId_fkey" FOREIGN KEY ("parentTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
