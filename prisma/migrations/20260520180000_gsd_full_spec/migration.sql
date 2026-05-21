-- CreateEnum
CREATE TYPE "Team" AS ENUM ('DEV', 'OPS', 'CORE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "team" "Team",
ADD COLUMN "devTeamAccess" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "team" "Team" NOT NULL DEFAULT 'OPS';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "displayId" SERIAL NOT NULL,
ADD COLUMN "closedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_displayId_key" ON "tasks"("displayId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");
