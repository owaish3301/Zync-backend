/*
  Warnings:

  - You are about to drop the column `usedById` on the `Invite` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_usedById_fkey";

-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "usedById",
ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 hours';

-- CreateTable
CREATE TABLE "InviteRedemption" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "redeemedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InviteRedemption_inviteId_idx" ON "InviteRedemption"("inviteId");

-- CreateIndex
CREATE INDEX "InviteRedemption_redeemedByUserId_idx" ON "InviteRedemption"("redeemedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteRedemption_redeemedByUserId_key" ON "InviteRedemption"("redeemedByUserId");

-- AddForeignKey
ALTER TABLE "InviteRedemption" ADD CONSTRAINT "InviteRedemption_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteRedemption" ADD CONSTRAINT "InviteRedemption_redeemedByUserId_fkey" FOREIGN KEY ("redeemedByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
