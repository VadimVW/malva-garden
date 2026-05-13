import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CartToken } from "../common/decorators/cart-token.decorator";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Post()
  create() {
    return this.cart.createFresh();
  }

  @Get()
  get(@CartToken() token?: string) {
    return this.cart.getByToken(token);
  }

  @Post("items")
  addItem(@CartToken() token: string | undefined, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(token, dto);
  }

  @Patch("items/:productId")
  updateQty(
    @CartToken() token: string | undefined,
    @Param("productId") productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateQuantity(token, productId, dto.quantity);
  }

  @Delete("items/:productId")
  removeItem(
    @CartToken() token: string | undefined,
    @Param("productId") productId: string,
  ) {
    return this.cart.removeItem(token, productId);
  }
}
