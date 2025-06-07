-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'BUYER';
