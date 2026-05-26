-- Customer password reset and Google sign-in

ALTER TABLE "Customer" ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "Customer"
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "passwordResetTokenHash" TEXT,
  ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3),
  ADD COLUMN "passwordResetRequestedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Customer_googleId_key" ON "Customer"("googleId");
CREATE UNIQUE INDEX "Customer_passwordResetTokenHash_key" ON "Customer"("passwordResetTokenHash");
