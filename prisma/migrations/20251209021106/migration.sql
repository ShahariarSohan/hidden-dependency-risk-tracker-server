/*
  Warnings:

  - A unique constraint covering the columns `[teamId]` on the table `managers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "managers" ADD COLUMN     "teamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "managers_teamId_key" ON "managers"("teamId");

-- AddForeignKey
ALTER TABLE "managers" ADD CONSTRAINT "managers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
