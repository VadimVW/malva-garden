import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CartToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const raw = req.headers["x-cart-token"];
    if (Array.isArray(raw)) return raw[0];
    return typeof raw === "string" ? raw : undefined;
  },
);
