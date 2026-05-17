import { Body, Controller, Get, Param, Post } from "@nestjs/common";
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
  create(@Body() dto: CreateOrderDto) {
    return this.orders.createFromCart(dto);
  }

  @Post(":orderNumber/payment/wayforpay")
  initiateWayforpay(@Param("orderNumber") orderNumber: string) {
    return this.wayforpay.buildPurchaseForm(orderNumber);
  }

  @Get(":orderNumber/payment-status")
  paymentStatus(@Param("orderNumber") orderNumber: string) {
    return this.wayforpay.getPublicPaymentStatus(orderNumber);
  }
}
