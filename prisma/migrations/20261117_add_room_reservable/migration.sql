-- AlterTable
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "room_reservable" BOOLEAN NOT NULL DEFAULT false;
