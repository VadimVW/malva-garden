-- Payment access token hash for public payment endpoints (WayForPay status/pay/sync)
ALTER TABLE "Order" ADD COLUMN "paymentAccessTokenHash" TEXT;
