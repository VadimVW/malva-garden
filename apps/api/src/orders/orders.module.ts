import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module";
import { CustomerModule } from "../customer/customer.module";
import { PaymentsModule } from "../payments/payments.module";
import { SettingsModule } from "../settings/settings.module";
import { AdminOrdersController } from "./admin-orders.controller";
import { PublicOrdersController } from "./public-orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CartModule, CustomerModule, PaymentsModule, SettingsModule],
  controllers: [PublicOrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
