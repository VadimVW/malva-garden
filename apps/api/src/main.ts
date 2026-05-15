import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const corsOrigins = [
    process.env.WEB_ORIGIN ?? "http://localhost:3000",
    process.env.ADMIN_ORIGIN ?? "http://localhost:3001",
  ]
    .flatMap((v) => v.split(","))
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: [...new Set(corsOrigins)],
    credentials: true,
  });
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
}

bootstrap();
