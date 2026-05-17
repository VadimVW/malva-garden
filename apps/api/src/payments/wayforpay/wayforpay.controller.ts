import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { WayforpayService } from "./wayforpay.service";

@Controller("payments/wayforpay")
export class WayforpayController {
  constructor(private readonly wayforpay: WayforpayService) {}

  @Post("callback")
  async callback(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const payload =
      body && Object.keys(body).length > 0
        ? body
        : ((req.body as Record<string, unknown>) ?? {});
    return this.wayforpay.handleCallback(payload);
  }
}
