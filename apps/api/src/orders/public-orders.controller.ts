import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { clientIp } from "../common/client-ip";
import { RateLimitService } from "../common/rate-limit.service";
import { OptionalJwtCustomerAuthGuard } from "../customer/optional-jwt-customer.guard";
import type { CurrentCustomer } from "../customer/customer.types";
import { WayforpayService } from "../payments/wayforpay/wayforpay.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

const PAYMENT_RATE_MAX = 30;
const PAYMENT_RATE_WINDOW_MS = 15 * 60 * 1000;

@Controller("orders")
export class PublicOrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly wayforpay: WayforpayService,
    private readonly rateLimit: RateLimitService,
  ) {}

  private throttlePayment(ip: string) {
    this.rateLimit.throttle(
      `orders-payment:${ip}`,
      PAYMENT_RATE_MAX,
      PAYMENT_RATE_WINDOW_MS,
    );
  }

  @Post()
  @UseGuards(OptionalJwtCustomerAuthGuard)
  create(
    @Body() dto: CreateOrderDto,
    @Req() req: { user?: CurrentCustomer | null },
  ) {
    return this.orders.createFromCart(dto, req.user?.id);
  }

  @Post(":orderNumber/payment/wayforpay")
  async initiateWayforpay(
    @Param("orderNumber") orderNumber: string,
    @Query("accessToken") accessToken: string | undefined,
    @Req() req: Request,
  ) {
    this.throttlePayment(clientIp(req));
    await this.orders.assertPaymentAccess(orderNumber, accessToken);
    return this.wayforpay.buildPurchaseForm(orderNumber);
  }

  @Get(":orderNumber/payment-status")
  async paymentStatus(
    @Param("orderNumber") orderNumber: string,
    @Query("accessToken") accessToken: string | undefined,
    @Req() req: Request,
  ) {
    this.throttlePayment(clientIp(req));
    await this.orders.assertPaymentAccess(orderNumber, accessToken);
    return this.wayforpay.getPublicPaymentStatus(orderNumber);
  }

  @Post(":orderNumber/payment/wayforpay/sync")
  async syncWayforpay(
    @Param("orderNumber") orderNumber: string,
    @Query("accessToken") accessToken: string | undefined,
    @Req() req: Request,
  ) {
    this.throttlePayment(clientIp(req));
    await this.orders.assertPaymentAccess(orderNumber, accessToken);
    return this.wayforpay.syncPaymentStatusFromProvider(orderNumber);
  }
}
