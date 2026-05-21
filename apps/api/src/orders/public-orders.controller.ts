import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { OptionalJwtCustomerAuthGuard } from "../customer/optional-jwt-customer.guard";
import type { CurrentCustomer } from "../customer/customer.types";
import { WayforpayService } from "../payments/wayforpay/wayforpay.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class PublicOrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly wayforpay: WayforpayService,
  ) {}

  @Post()
  @UseGuards(OptionalJwtCustomerAuthGuard)
  create(
    @Body() dto: CreateOrderDto,
    @Req() req: { user?: CurrentCustomer | null },
  ) {
    return this.orders.createFromCart(dto, req.user?.id);
  }

  @Post(":orderNumber/payment/wayforpay")
  initiateWayforpay(@Param("orderNumber") orderNumber: string) {
    return this.wayforpay.buildPurchaseForm(orderNumber);
  }

  @Get(":orderNumber/payment-status")
  paymentStatus(@Param("orderNumber") orderNumber: string) {
    return this.wayforpay.getPublicPaymentStatus(orderNumber);
  }

  @Post(":orderNumber/payment/wayforpay/sync")
  syncWayforpay(@Param("orderNumber") orderNumber: string) {
    return this.wayforpay.syncPaymentStatusFromProvider(orderNumber);
  }
}
