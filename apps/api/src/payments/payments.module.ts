import { Module } from "@nestjs/common";
import { WayforpayController } from "./wayforpay/wayforpay.controller";
import { WayforpayService } from "./wayforpay/wayforpay.service";

@Module({
  controllers: [WayforpayController],
  providers: [WayforpayService],
  exports: [WayforpayService],
})
export class PaymentsModule {}
