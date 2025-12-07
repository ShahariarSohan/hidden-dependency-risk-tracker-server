-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "managers" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';
