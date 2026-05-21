import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { moneyToString } from "../common/money";
import { normalizePhoneUa } from "./phone.util";

@Injectable()
export class CustomerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ordersWhereForCustomer(customerId: string): Promise<Prisma.OrderWhereInput> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException();

    const or: Prisma.OrderWhereInput[] = [{ customerId: customer.id }];

    if (customer.emailVerifiedAt) {
      or.push({
        customerId: null,
        customerEmail: { equals: customer.email, mode: "insensitive" },
      });
      const phone = normalizePhoneUa(customer.phone);
      if (phone) {
        or.push({
          customerId: null,
          customerPhone: phone,
        });
      }
    }

    return { OR: or };
  }

  async list(customerId: string, page: number, limit: number) {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;
    const where = await this.ordersWhereForCustomer(customerId);

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          customerName: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        totalAmount: moneyToString(o.totalAmount),
        createdAt: o.createdAt,
        customerName: o.customerName,
      })),
      page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 0,
    };
  }

  async findByOrderNumber(customerId: string, orderNumber: string) {
    const where = await this.ordersWhereForCustomer(customerId);
    const order = await this.prisma.order.findFirst({
      where: { ...where, orderNumber },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Замовлення не знайдено");

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: moneyToString(order.totalAmount),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryMethod: order.deliveryMethod,
      deliveryCity: order.deliveryCity,
      deliveryAddress: order.deliveryAddress,
      comment: order.comment,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        id: i.id,
        productNameSnapshot: i.productNameSnapshot,
        priceSnapshot: moneyToString(i.priceSnapshot),
        quantity: i.quantity,
        total: moneyToString(i.total),
      })),
    };
  }

  async assertOrderAccess(customerId: string, orderNumber: string) {
    const where = await this.ordersWhereForCustomer(customerId);
    const order = await this.prisma.order.findFirst({
      where: { ...where, orderNumber },
      select: { id: true },
    });
    if (!order) throw new ForbiddenException("Немає доступу до цього замовлення");
    return order;
  }
}
