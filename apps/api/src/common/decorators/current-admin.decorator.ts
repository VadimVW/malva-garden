import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type AdminUserPayload = { id: string; email: string };

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUserPayload => {
    const req = ctx.switchToHttp().getRequest<{ user: AdminUserPayload }>();
    return req.user;
  },
);
