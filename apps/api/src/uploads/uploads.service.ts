import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { extname, join, resolve } from "path";
import { UPLOAD_MIME_TO_EXT } from "./uploads.constants";

@Injectable()
export class UploadsService {
  readonly uploadDir: string;
  readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const configuredDir =
      this.config.get<string>("UPLOAD_DIR")?.trim() || "uploads";
    this.uploadDir = resolve(configuredDir);
    mkdirSync(this.uploadDir, { recursive: true });

    const apiOrigin =
      this.config.get<string>("API_PUBLIC_ORIGIN")?.trim() ||
      `http://localhost:${this.config.get<string>("PORT") || "4000"}`;
    this.publicBaseUrl = apiOrigin.replace(/\/$/, "");
  }

  saveUploadedFile(file: Express.Multer.File): string {
    const ext =
      UPLOAD_MIME_TO_EXT[file.mimetype] ??
      extname(file.originalname).toLowerCase() ??
      ".bin";
    const filename = `${randomUUID()}${ext}`;
    writeFileSync(this.absolutePath(filename), file.buffer);
    return filename;
  }

  publicUrl(filename: string): string {
    return `${this.publicBaseUrl}/uploads/${filename}`;
  }

  absolutePath(filename: string): string {
    return join(this.uploadDir, filename);
  }
}
