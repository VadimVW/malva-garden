import { Controller, Get, Query } from "@nestjs/common";
import { NovaposhtaService } from "./novaposhta.service";

@Controller("delivery/nova-poshta")
export class NovaposhtaController {
  constructor(private readonly novaposhta: NovaposhtaService) {}

  @Get("settlements")
  getSettlements(@Query("q") q?: string) {
    return this.novaposhta.getSettlements(q);
  }

  @Get("warehouses")
  getWarehouses(
    @Query("cityRef") cityRef: string,
    @Query("pointType") pointType: string,
    @Query("page") page?: string,
    @Query("find") find?: string,
  ) {
    return this.novaposhta.getWarehouses({
      cityRef,
      pointType: pointType === "postomat" ? "postomat" : "warehouse",
      page: page ? Number(page) : 1,
      find,
    });
  }
}
