import { Module } from "@nestjs/common";
import { AdminPagesController } from "./admin-pages.controller";
import { PublicPagesController } from "./public-pages.controller";
import { PagesService } from "./pages.service";

@Module({
  controllers: [PublicPagesController, AdminPagesController],
  providers: [PagesService],
})
export class PagesModule {}
