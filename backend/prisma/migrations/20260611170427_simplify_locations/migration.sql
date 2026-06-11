/*
  Warnings:

  - You are about to drop the column `parentId` on the `Location` table. All the data in the column will be lost.
  - Made the column `code` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_parentId_fkey";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "parentId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "roomNumber" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "zone" TEXT,
ALTER COLUMN "code" SET NOT NULL;
