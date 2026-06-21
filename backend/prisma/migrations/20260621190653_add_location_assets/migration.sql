-- DropForeignKey
ALTER TABLE "MaintenanceAttachment" DROP CONSTRAINT "MaintenanceAttachment_uploadedByUserId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceAttachment" ALTER COLUMN "uploadedByUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MaintenanceAsset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationAsset" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTicketAsset" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceTicketAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceAsset_code_key" ON "MaintenanceAsset"("code");

-- CreateIndex
CREATE INDEX "MaintenanceAsset_isActive_idx" ON "MaintenanceAsset"("isActive");

-- CreateIndex
CREATE INDEX "MaintenanceAsset_category_idx" ON "MaintenanceAsset"("category");

-- CreateIndex
CREATE INDEX "LocationAsset_locationId_isActive_idx" ON "LocationAsset"("locationId", "isActive");

-- CreateIndex
CREATE INDEX "LocationAsset_assetId_idx" ON "LocationAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationAsset_locationId_assetId_key" ON "LocationAsset"("locationId", "assetId");

-- CreateIndex
CREATE INDEX "MaintenanceTicketAsset_assetId_idx" ON "MaintenanceTicketAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceTicketAsset_ticketId_assetId_key" ON "MaintenanceTicketAsset"("ticketId", "assetId");

-- AddForeignKey
ALTER TABLE "LocationAsset" ADD CONSTRAINT "LocationAsset_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationAsset" ADD CONSTRAINT "LocationAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MaintenanceAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicketAsset" ADD CONSTRAINT "MaintenanceTicketAsset_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MaintenanceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicketAsset" ADD CONSTRAINT "MaintenanceTicketAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MaintenanceAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAttachment" ADD CONSTRAINT "MaintenanceAttachment_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
