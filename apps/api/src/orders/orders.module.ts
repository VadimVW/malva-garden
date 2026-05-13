import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module";
import { AdminOrdersController } from "./admin-orders.controller";
import { PublicOrdersController } from "./public-orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CartModule],
  controllers: [PublicOrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
