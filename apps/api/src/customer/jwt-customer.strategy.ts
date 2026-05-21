import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import type { CustomerJwtPayload, CurrentCustomer } from "./customer.types";

@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(
  Strategy,
  "jwt-customer",
) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET") ?? "dev-secret-change-me",
    });
  }

  async validate(payload: CustomerJwtPayload): Promise<CurrentCustomer> {
    if (payload.role !== "customer") {
      throw new UnauthorizedException();
    }
    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });
    if (!customer) throw new UnauthorizedException();
    return { id: customer.id, email: customer.email };
  }
}
