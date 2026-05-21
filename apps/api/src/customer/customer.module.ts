import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "../auth/auth.module";
import { CustomerAddressesService } from "./customer-addresses.service";
import { CustomerAuthController } from "./customer-auth.controller";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerMeController } from "./customer-me.controller";
import { CustomerOrdersService } from "./customer-orders.service";
import { JwtCustomerStrategy } from "./jwt-customer.strategy";

@Module({
  imports: [AuthModule, PassportModule.register({})],
  controllers: [CustomerAuthController, CustomerMeController],
  providers: [
    CustomerAuthService,
    CustomerOrdersService,
    CustomerAddressesService,
    JwtCustomerStrategy,
  ],
  exports: [CustomerAuthService, CustomerOrdersService, JwtCustomerStrategy],
})
export class CustomerModule {}
