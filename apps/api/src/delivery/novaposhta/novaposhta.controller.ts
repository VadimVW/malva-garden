import { Controller, Get, Query, Req } from "@nestjs/common";
import type { Request } from "express";
import { clientIp } from "../../common/client-ip";
import { RateLimitService } from "../../common/rate-limit.service";
import { NovaposhtaService } from "./novaposhta.service";

const NP_RATE_MAX = 120;
const NP_RATE_WINDOW_MS = 60 * 1000;

@Controller("delivery/nova-poshta")
export class NovaposhtaController {
  constructor(
    private readonly novaposhta: NovaposhtaService,
    private readonly rateLimit: RateLimitService,
  ) {}

  private throttle(req: Request) {
    this.rateLimit.throttle(
      `nova-poshta:${clientIp(req)}`,
      NP_RATE_MAX,
      NP_RATE_WINDOW_MS,
    );
  }

  @Get("settlements")
  getSettlements(@Query("q") q: string | undefined, @Req() req: Request) {
    this.throttle(req);
    return this.novaposhta.getSettlements(q);
  }

  @Get("warehouses")
  getWarehouses(
    @Query("cityRef") cityRef: string,
    @Query("pointType") pointType: string,
    @Query("page") page: string | undefined,
    @Query("find") find: string | undefined,
    @Req() req: Request,
  ) {
    this.throttle(req);
    return this.novaposhta.getWarehouses({
      cityRef,
      pointType: pointType === "postomat" ? "postomat" : "warehouse",
      page: page ? Number(page) : 1,
      find,
    });
  }
}
