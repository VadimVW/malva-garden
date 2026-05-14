import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { AdminOrdersQueryDto } from "./dto/admin-orders-query.dto";
import { ManagerCommentDto } from "./dto/manager-comment.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { OrdersService } from "./orders.service";

@Controller("admin/orders")
@UseGuards(JwtAdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Query() query: AdminOrdersQueryDto) {
    return this.orders.findManyAdmin(query.page ?? 1, query.limit ?? 20);
  }

  @Get(":id")
  one(@Param("id") id: string) {
    return this.orders.findOneAdmin(id);
  }

  @Patch(":id/status")
  status(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.orderStatus);
  }

  @Patch(":id/payment-status")
  paymentStatus(@Param("id") id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.orders.updatePaymentStatus(id, dto.paymentStatus);
  }

  @Patch(":id/manager-comment")
  managerComment(@Param("id") id: string, @Body() dto: ManagerCommentDto) {
    return this.orders.updateManagerComment(id, dto.managerComment);
  }
}
