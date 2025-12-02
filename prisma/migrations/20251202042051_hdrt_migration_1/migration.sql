/*
  Warnings:

  - Added the required column `contactNumber` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `managers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "contactNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "contactNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "managers" ADD COLUMN     "contactNumber" TEXT NOT NULL;
