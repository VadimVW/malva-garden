import "reflect-metadata";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { resolve } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cookieParser());
  const uploadDir = resolve(process.env.UPLOAD_DIR?.trim() || "uploads");
  app.useStaticAssets(uploadDir, { prefix: "/uploads" });
  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "", method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const corsOrigins = [
    process.env.WEB_ORIGIN ?? "http://localhost:3300",
    process.env.ADMIN_ORIGIN ?? "http://localhost:3301",
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
