import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { JwtAdminAuthGuard } from "../auth/jwt-admin.guard";
import {
  UPLOAD_ALLOWED_MIME_TYPES,
  UPLOAD_MAX_BYTES,
} from "./uploads.constants";
import { UploadsService } from "./uploads.service";

@Controller("admin/uploads")
@UseGuards(JwtAdminAuthGuard)
export class AdminUploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: UPLOAD_MAX_BYTES },
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!UPLOAD_ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(
            new BadRequestException(
              "Дозволені лише зображення JPEG, PNG, WebP або GIF",
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Файл не передано");
    }
    const filename = this.uploads.saveUploadedFile(file);
    return { url: this.uploads.publicUrl(filename) };
  }
}
