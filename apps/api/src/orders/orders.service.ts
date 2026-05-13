import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, PaymentStatus, ProductStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { moneyToString } from "../common/money";
import { CreateOrderDto } from "./dto/create-order.dto";

function generateOrderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MG-${t}-${r}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
  ) {}

  async createFromCart(dto: CreateOrderDto) {
    const cart = await this.cart.loadCartForCheckout(dto.cartToken);
    if (!cart) throw new BadRequestException("Кошик не знайдено");
    if (cart.expiresAt < new Date()) {
      throw new BadRequestException("Кошик прострочено");
    }
    if (!cart.items.length) {
      throw new BadRequestException("Кошик порожній");
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of cart.items) {
        const p = await tx.product.findUnique({ where: { id: line.productId } });
        if (!p || p.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(`Товар ${line.productId} недоступний`);
        }
        if (p.stockQuantity < line.quantity) {
          throw new BadRequestException(`Недостатньо залишку для ${p.name}`);
        }
      }

      let total = new Decimal(0);
      for (const line of cart.items) {
        total = total.add(line.product.price.mul(line.quantity));
      }

      const orderNumber = generateOrderNumber();

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          deliveryMethod: dto.deliveryMethod,
          deliveryCity: dto.deliveryCity,
          deliveryAddress: dto.deliveryAddress,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.NEW,
          totalAmount: total,
          comment: dto.comment,
          items: {
            create: cart.items.map((line) => {
              const lineTotal = line.product.price.mul(line.quantity);
              return {
                productId: line.productId,
                productNameSnapshot: line.product.name,
                priceSnapshot: line.product.price,
                quantity: line.quantity,
                total: lineTotal,
              };
            }),
          },
        },
        include: { items: true },
      });

      for (const line of cart.items) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stockQuantity: { decrement: line.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: moneyToString(order.totalAmount),
      };
    });
  }

  async findManyAdmin(page: number, limit: number) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { items: true },
      }),
      this.prisma.order.count(),
    ]);
    return {
      items: items.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        totalAmount: moneyToString(o.totalAmount),
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        createdAt: o.createdAt,
      })),
      page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOneAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Замовлення не знайдено");
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryMethod: order.deliveryMethod,
      deliveryCity: order.deliveryCity,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      totalAmount: moneyToString(order.totalAmount),
      comment: order.comment,
      managerComment: order.managerComment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productNameSnapshot: i.productNameSnapshot,
        priceSnapshot: moneyToString(i.priceSnapshot),
        quantity: i.quantity,
        total: moneyToString(i.total),
      })),
    };
  }

  async updateStatus(id: string, orderStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Замовлення не знайдено");
    return this.prisma.order.update({
      where: { id },
      data: { orderStatus },
    });
  }

  async updateManagerComment(id: string, managerComment: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Замовлення не знайдено");
    return this.prisma.order.update({
      where: { id },
      data: { managerComment },
    });
  }
}
