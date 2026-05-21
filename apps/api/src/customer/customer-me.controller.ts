import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentCustomer } from "./decorators/current-customer.decorator";
import { CustomerAddressesService } from "./customer-addresses.service";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerOrdersService } from "./customer-orders.service";
import { CreateCustomerAddressDto } from "./dto/create-customer-address.dto";
import { CustomerOrdersQueryDto } from "./dto/customer-orders-query.dto";
import { UpdateCustomerAddressDto } from "./dto/update-customer-address.dto";
import { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";
import { JwtCustomerAuthGuard } from "./jwt-customer.guard";
import type { CurrentCustomer as CurrentCustomerType } from "./customer.types";

@Controller("customer")
@UseGuards(JwtCustomerAuthGuard)
export class CustomerMeController {
  constructor(
    private readonly auth: CustomerAuthService,
    private readonly orders: CustomerOrdersService,
    private readonly addresses: CustomerAddressesService,
  ) {}

  @Get("me")
  me(@CurrentCustomer() customer: CurrentCustomerType) {
    return this.auth.getMe(customer.id);
  }

  @Patch("me")
  updateProfile(
    @CurrentCustomer() customer: CurrentCustomerType,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.auth.updateProfile(customer.id, dto);
  }

  @Post("me/resend-verification")
  resendVerification(@CurrentCustomer() customer: CurrentCustomerType) {
    return this.auth.resendVerification(customer.id);
  }

  @Get("me/orders")
  listOrders(
    @CurrentCustomer() customer: CurrentCustomerType,
    @Query() query: CustomerOrdersQueryDto,
  ) {
    return this.orders.list(
      customer.id,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get("me/orders/:orderNumber")
  orderDetail(
    @CurrentCustomer() customer: CurrentCustomerType,
    @Param("orderNumber") orderNumber: string,
  ) {
    return this.orders.findByOrderNumber(customer.id, orderNumber);
  }

  @Get("me/addresses")
  listAddresses(@CurrentCustomer() customer: CurrentCustomerType) {
    return this.addresses.list(customer.id);
  }

  @Post("me/addresses")
  createAddress(
    @CurrentCustomer() customer: CurrentCustomerType,
    @Body() dto: CreateCustomerAddressDto,
  ) {
    return this.addresses.create(customer.id, dto);
  }

  @Patch("me/addresses/:id")
  updateAddress(
    @CurrentCustomer() customer: CurrentCustomerType,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerAddressDto,
  ) {
    return this.addresses.update(customer.id, id, dto);
  }

  @Delete("me/addresses/:id")
  deleteAddress(
    @CurrentCustomer() customer: CurrentCustomerType,
    @Param("id") id: string,
  ) {
    return this.addresses.remove(customer.id, id);
  }
}
