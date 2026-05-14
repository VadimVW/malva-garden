import { Controller, Get } from "@nestjs/common";
import { SettingsService } from "./settings.service";

/** Публічне читання ключ-значення для вітрини (без секретів у значеннях). */
@Controller("site-settings")
export class PublicSiteSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  list() {
    return this.settings.findAllPublic();
  }
}
