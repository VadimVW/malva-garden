import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";

/** Зображення керуються окремими ендпоінтами `admin/products/:productId/images`. */
export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ["images"] as const),
) {}
