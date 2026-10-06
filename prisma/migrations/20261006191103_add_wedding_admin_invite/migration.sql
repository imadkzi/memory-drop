-- CreateEnum
CREATE TYPE "AdminInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED');

-- CreateTable
CREATE TABLE "wedding_admin_invite" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WeddingAdminRole" NOT NULL DEFAULT 'ADMIN',
    "tokenHash" TEXT NOT NULL,
    "status" "AdminInviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wedding_admin_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wedding_admin_invite_tokenHash_key" ON "wedding_admin_invite"("tokenHash");

-- CreateIndex
CREATE INDEX "wedding_admin_invite_weddingId_status_idx" ON "wedding_admin_invite"("weddingId", "status");

-- CreateIndex
CREATE INDEX "wedding_admin_invite_email_idx" ON "wedding_admin_invite"("email");

-- AddForeignKey
ALTER TABLE "wedding_admin_invite" ADD CONSTRAINT "wedding_admin_invite_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
