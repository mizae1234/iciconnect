-- AlterTable
ALTER TABLE "employees" RENAME COLUMN "employee_code" TO "employeeId";
ALTER INDEX "employees_employee_code_key" RENAME TO "employees_employeeId_key";
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "room_reservable" BOOLEAN NOT NULL DEFAULT false;
