import { Module } from "@nestjs/common";
import { NovaposhtaController } from "./novaposhta/novaposhta.controller";
import { NovaposhtaService } from "./novaposhta/novaposhta.service";

@Module({
  controllers: [NovaposhtaController],
  providers: [NovaposhtaService],
  exports: [NovaposhtaService],
})
export class DeliveryModule {}
