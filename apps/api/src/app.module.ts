import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { CartModule } from "./cart/cart.module";
import { CategoriesModule } from "./categories/categories.module";
import { OrdersModule } from "./orders/orders.module";
import { PagesModule } from "./pages/pages.module";
import { ProductsModule } from "./products/products.module";
import { SettingsModule } from "./settings/settings.module";
import { DeliveryModule } from "./delivery/delivery.module";
import { CustomerModule } from "./customer/customer.module";
import { MailModule } from "./mail/mail.module";
import { UploadsModule } from "./uploads/uploads.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PagesModule,
    SettingsModule,
    DeliveryModule,
    MailModule,
    CustomerModule,
    UploadsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
