import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import { CreateSiteSettingDto, UpsertSiteSettingDto } from "./dto/site-setting.dto";
import { SettingsService } from "./settings.service";

@Controller("admin/settings")
@UseGuards(JwtAdminAuthGuard)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  list() {
    return this.settings.findAllAdmin();
  }

  @Get(":key")
  one(@Param("key") key: string) {
    return this.settings.findOneAdmin(key);
  }

  @Post()
  create(@Body() dto: CreateSiteSettingDto) {
    return this.settings.create(dto);
  }

  @Put(":key")
  upsert(@Param("key") key: string, @Body() dto: UpsertSiteSettingDto) {
    return this.settings.upsert(key, dto.value);
  }

  @Delete(":key")
  remove(@Param("key") key: string) {
    return this.settings.remove(key);
  }
}
