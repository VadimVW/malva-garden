import { Controller, Get, Param } from "@nestjs/common";
import { PagesService } from "./pages.service";

@Controller("pages")
export class PublicPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get(":slug")
  get(@Param("slug") slug: string) {
    return this.pages.findPublicBySlug(slug);
  }
}
