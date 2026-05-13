import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "../prisma/prisma.service";
import { moneyToString } from "../common/money";
import { AddCartItemDto } from "./dto/add-cart-item.dto";

const CART_TTL_DAYS = 30;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private futureExpiry() {
    const d = new Date();
    d.setDate(d.getDate() + CART_TTL_DAYS);
    return d;
  }

  async createFresh() {
    return this.prisma.cart.create({
      data: { expiresAt: this.futureExpiry() },
      select: { token: true, expiresAt: true },
    });
  }

  private async resolveCart(token?: string) {
    if (!token) {
      throw new BadRequestException("Потрібен заголовок X-Cart-Token");
    }
    const cart = await this.prisma.cart.findUnique({
      where: { token },
      include: {
        items: { include: { product: { include: { images: true } } } },
      },
    });
    if (!cart) throw new NotFoundException("Кошик не знайдено");
    if (cart.expiresAt < new Date()) {
      throw new BadRequestException("Кошик прострочено, створіть новий");
    }
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { expiresAt: this.futureExpiry() },
    });
    return cart;
  }

  async getByToken(token?: string) {
    const cart = await this.resolveCart(token);
    return this.serialize(cart.id);
  }

  private async serialize(cartId: string) {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: {
        items: { include: { product: { include: { images: true } } } },
      },
    });
    const items = cart.items.map((line) => {
      const p = line.product;
      const main =
        p.images.find((i) => i.isMain) ?? p.images[0] ?? null;
      const lineTotal = p.price.mul(line.quantity);
      return {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        quantity: line.quantity,
        unitPrice: moneyToString(p.price),
        lineTotal: moneyToString(lineTotal),
        imageUrl: main?.imageUrl ?? null,
        stockQuantity: p.stockQuantity,
      };
    });
    const subtotal = cart.items.reduce(
      (acc, line) => acc.add(line.product.price.mul(line.quantity)),
      new Decimal(0),
    );
    return {
      token: cart.token,
      items,
      subtotal: moneyToString(subtotal),
    };
  }

  async addItem(token: string | undefined, dto: AddCartItemDto) {
    const cart = await this.resolveCart(token);
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException("Товар недоступний");
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
    });
    const nextQty = (existing?.quantity ?? 0) + dto.quantity;
    if (product.stockQuantity < nextQty) {
      throw new BadRequestException("Недостатньо на складі");
    }
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: dto.quantity,
      },
      update: {
        quantity: nextQty,
      },
    });
    return this.serialize(cart.id);
  }

  async updateQuantity(
    token: string | undefined,
    productId: string,
    quantity: number,
  ) {
    const cart = await this.resolveCart(token);
    const line = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      include: { product: true },
    });
    if (!line) throw new NotFoundException("Позиція не в кошику");
    if (line.product.stockQuantity < quantity) {
      throw new BadRequestException("Недостатньо на складі");
    }
    await this.prisma.cartItem.update({
      where: { id: line.id },
      data: { quantity },
    });
    return this.serialize(cart.id);
  }

  async removeItem(token: string | undefined, productId: string) {
    const cart = await this.resolveCart(token);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return this.serialize(cart.id);
  }

  async loadCartForCheckout(token: string) {
    return this.prisma.cart.findUnique({
      where: { token },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  async clearCart(cartId: string) {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
