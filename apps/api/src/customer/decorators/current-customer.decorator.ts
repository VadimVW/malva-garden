import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { CurrentCustomer as CustomerPrincipal } from "../customer.types";

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CustomerPrincipal => {
    const req = ctx.switchToHttp().getRequest<{ user: CustomerPrincipal }>();
    return req.user;
  },
);
