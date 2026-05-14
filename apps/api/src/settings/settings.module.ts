import { Module } from "@nestjs/common";
import { AdminSettingsController } from "./admin-settings.controller";
import { PublicSiteSettingsController } from "./public-site-settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  controllers: [PublicSiteSettingsController, AdminSettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
