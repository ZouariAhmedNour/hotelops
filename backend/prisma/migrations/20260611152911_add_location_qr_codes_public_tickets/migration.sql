-- DropForeignKey
ALTER TABLE "MaintenanceTicket" DROP CONSTRAINT "MaintenanceTicket_reportedByUserId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceTicket" ADD COLUMN     "publicReporterId" INTEGER,
ADD COLUMN     "qrCodeId" INTEGER,
ALTER COLUMN "reportedByUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LocationQrCode" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScannedAt" TIMESTAMP(3),
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationQrCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicTicketReporter" (
    "id" SERIAL NOT NULL,
    "reporterType" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "roomNumber" TEXT,
    "reservationCode" TEXT,
    "sourceIp" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicTicketReporter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationQrCode_token_key" ON "LocationQrCode"("token");

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_publicReporterId_fkey" FOREIGN KEY ("publicReporterId") REFERENCES "PublicTicketReporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "LocationQrCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationQrCode" ADD CONSTRAINT "LocationQrCode_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationQrCode" ADD CONSTRAINT "LocationQrCode_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
