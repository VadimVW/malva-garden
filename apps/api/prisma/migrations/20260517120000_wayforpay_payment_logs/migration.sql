-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PaymentCallbackLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'wayforpay',
    "orderReference" TEXT NOT NULL,
    "transactionStatus" TEXT,
    "amount" DECIMAL(10,2),
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentCallbackLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentCallbackLog_orderId_idx" ON "PaymentCallbackLog"("orderId");

-- CreateIndex
CREATE INDEX "PaymentCallbackLog_orderReference_idx" ON "PaymentCallbackLog"("orderReference");

-- AddForeignKey
ALTER TABLE "PaymentCallbackLog" ADD CONSTRAINT "PaymentCallbackLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
