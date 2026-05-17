import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Order, OrderItem, PaymentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "../../prisma/prisma.service";
import { moneyToString } from "../../common/money";
import {
  buildCallbackResponseSignString,
  buildCallbackSignString,
  buildPurchaseSignString,
  formatWayforpayAmount,
  hmacMd5,
} from "./wayforpay.crypto";

const WFP_PAY_URL = "https://secure.wayforpay.com/pay";

type OrderWithItems = Order & { items: OrderItem[] };

type WayforpayCallbackBody = Record<string, unknown>;

@Injectable()
export class WayforpayService {
  private readonly logger = new Logger(WayforpayService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private merchantAccount(): string {
    const v = this.config.get<string>("WAYFORPAY_MERCHANT_ACCOUNT");
    if (!v) throw new InternalServerErrorException("WAYFORPAY_MERCHANT_ACCOUNT не налаштовано");
    return v;
  }

  private merchantSecret(): string {
    const v = this.config.get<string>("WAYFORPAY_MERCHANT_SECRET");
    if (!v) throw new InternalServerErrorException("WAYFORPAY_MERCHANT_SECRET не налаштовано");
    return v;
  }

  private merchantDomain(): string {
    return (
      this.config.get<string>("WAYFORPAY_MERCHANT_DOMAIN") ??
      this.extractHost(this.config.get<string>("WEB_ORIGIN") ?? "localhost")
    );
  }

  private returnUrl(): string {
    const explicit = this.config.get<string>("WAYFORPAY_RETURN_URL");
    if (explicit) return explicit;
    const web = this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000";
    return `${web.replace(/\/$/, "")}/order/payment/return`;
  }

  private serviceUrl(): string {
    const explicit = this.config.get<string>("WAYFORPAY_SERVICE_URL");
    if (explicit) return explicit;
    const api =
      this.config.get<string>("API_PUBLIC_ORIGIN") ??
      `http://localhost:${this.config.get<string>("PORT") ?? "4000"}`;
    return `${api.replace(/\/$/, "")}/api/v1/payments/wayforpay/callback`;
  }

  private extractHost(origin: string): string {
    try {
      return new URL(origin).hostname;
    } catch {
      return origin.replace(/^https?:\/\//, "").split("/")[0] ?? origin;
    }
  }

  async buildPurchaseForm(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Замовлення не знайдено");
    if (order.paymentMethod !== "wayforpay") {
      throw new BadRequestException("Замовлення не передбачає онлайн-оплату");
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException("Замовлення вже оплачено");
    }

    const fields = this.purchaseFields(order);
    return {
      actionUrl: WFP_PAY_URL,
      fields,
    };
  }

  purchaseFields(order: OrderWithItems): Record<string, string | string[]> {
    const merchantAccount = this.merchantAccount();
    const merchantDomainName = this.merchantDomain();
    const secret = this.merchantSecret();
    const orderDate = Math.floor(order.createdAt.getTime() / 1000);
    const amount = formatWayforpayAmount(order.totalAmount);
    const currency = "UAH";
    const productName = order.items.map((i) => i.productNameSnapshot);
    const productCount = order.items.map((i) => String(i.quantity));
    const productPrice = order.items.map((i) =>
      formatWayforpayAmount(i.priceSnapshot),
    );

    const signString = buildPurchaseSignString({
      merchantAccount,
      merchantDomainName,
      orderReference: order.orderNumber,
      orderDate,
      amount,
      currency,
      productName,
      productCount,
      productPrice,
    });

    const fields: Record<string, string | string[]> = {
      merchantAccount,
      merchantAuthType: "SimpleSignature",
      merchantDomainName,
      merchantTransactionType: "AUTO",
      merchantTransactionSecureType: "AUTO",
      merchantSignature: hmacMd5(signString, secret),
      orderReference: order.orderNumber,
      orderDate: String(orderDate),
      amount,
      currency,
      returnUrl: `${this.returnUrl()}?orderNumber=${encodeURIComponent(order.orderNumber)}`,
      serviceUrl: this.serviceUrl(),
      language: "UA",
      productName,
      productPrice,
      productCount,
    };

    if (order.customerEmail) fields.clientEmail = order.customerEmail;
    if (order.customerPhone) fields.clientPhone = order.customerPhone;
    const nameParts = order.customerName.trim().split(/\s+/);
    if (nameParts[0]) fields.clientFirstName = nameParts[0];
    if (nameParts.length > 1) fields.clientLastName = nameParts.slice(1).join(" ");

    return fields;
  }

  verifyCallbackSignature(body: WayforpayCallbackBody): boolean {
    const expected = String(body.merchantSignature ?? "");
    if (!expected) return false;

    const signString = buildCallbackSignString({
      merchantAccount: String(body.merchantAccount ?? ""),
      orderReference: String(body.orderReference ?? ""),
      amount: String(body.amount ?? ""),
      currency: String(body.currency ?? ""),
      authCode: String(body.authCode ?? ""),
      cardPan: String(body.cardPan ?? ""),
      transactionStatus: String(body.transactionStatus ?? ""),
      reasonCode: String(body.reasonCode ?? ""),
    });

    const actual = hmacMd5(signString, this.merchantSecret());
    return actual === expected;
  }

  async handleCallback(body: WayforpayCallbackBody) {
    if (!this.verifyCallbackSignature(body)) {
      this.logger.warn("WayForPay callback: invalid signature");
      throw new BadRequestException("Invalid signature");
    }

    const orderReference = String(body.orderReference ?? "");
    const transactionStatus = String(body.transactionStatus ?? "");
    const amountStr = String(body.amount ?? "");

    const order = await this.prisma.order.findUnique({
      where: { orderNumber: orderReference },
      include: { items: true },
    });
    if (!order) {
      this.logger.warn(`WayForPay callback: order not found ${orderReference}`);
      return this.callbackResponse(orderReference);
    }

    await this.prisma.paymentCallbackLog.create({
      data: {
        orderId: order.id,
        provider: "wayforpay",
        orderReference,
        transactionStatus,
        amount: amountStr ? new Decimal(amountStr) : null,
        rawPayload: body as object,
      },
    });

    const expectedAmount = formatWayforpayAmount(order.totalAmount);
    if (amountStr && amountStr !== expectedAmount) {
      this.logger.error(
        `WayForPay amount mismatch for ${orderReference}: ${amountStr} vs ${expectedAmount}`,
      );
      return this.callbackResponse(orderReference);
    }

    const nextStatus = this.mapTransactionStatus(transactionStatus);
    if (nextStatus && order.paymentStatus !== PaymentStatus.PAID) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: nextStatus,
          paidAt: nextStatus === PaymentStatus.PAID ? new Date() : order.paidAt,
        },
      });
    }

    return this.callbackResponse(orderReference);
  }

  private mapTransactionStatus(status: string): PaymentStatus | null {
    const s = status.toLowerCase();
    if (s === "approved") return PaymentStatus.PAID;
    if (
      s === "declined" ||
      s === "expired" ||
      s === "voided" ||
      s === "refunded"
    ) {
      return PaymentStatus.FAILED;
    }
    return null;
  }

  private callbackResponse(orderReference: string) {
    const time = Math.floor(Date.now() / 1000);
    const status = "accept";
    const signString = buildCallbackResponseSignString({
      orderReference,
      status,
      time,
    });
    return {
      orderReference,
      status,
      time,
      signature: hmacMd5(signString, this.merchantSecret()),
    };
  }

  async getPublicPaymentStatus(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        paymentMethod: true,
        paymentStatus: true,
        totalAmount: true,
      },
    });
    if (!order) throw new NotFoundException("Замовлення не знайдено");
    return {
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: moneyToString(order.totalAmount),
    };
  }
}
