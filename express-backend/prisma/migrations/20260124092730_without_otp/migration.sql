/*
  Warnings:

  - You are about to drop the column `is_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_verified",
ALTER COLUMN "role" SET DATA TYPE TEXT,
ALTER COLUMN "profilepicture" SET DEFAULT '',
ALTER COLUMN "profilepicture" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Otp";
