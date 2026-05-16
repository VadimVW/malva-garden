import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Корінь хоста (без /api/v1) — підказка для Render / браузера */
  @Get()
  getRoot() {
    return {
      name: "Malva Garden API",
      version: "v1",
      health: "/api/v1/health",
      products: "/api/v1/products",
    };
  }

  @Get("health")
  getHealth() {
    return this.appService.getHealth();
  }
}
