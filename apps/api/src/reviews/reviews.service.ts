import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, ProductStatus, ReviewStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AdminReviewsQueryDto } from "./dto/admin-reviews-query.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsQueryDto } from "./dto/reviews-query.dto";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";
import { formatReviewAuthorDisplayName } from "./review-display-name";
import { REVIEW_ELIGIBLE_ORDER_STATUSES } from "./review.constants";

export type ReviewEligibilityReason =
  | "EMAIL_NOT_VERIFIED"
  | "NO_PURCHASE"
  | "PENDING"
  | "ALREADY_PUBLISHED"
  | "RESUBMIT";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicByProductSlug(slug: string, query: ReviewsQueryDto) {
    const product = await this.findActiveProductBySlug(slug);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      productId: product.id,
      status: ReviewStatus.PUBLISHED,
    };

    const [items, total, summary] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          body: true,
          authorDisplayName: true,
          orderId: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.productReview.count({ where }),
      this.summaryForProduct(product.id),
    ]);

    return {
      items: items.map((r) => this.mapPublicReview(r)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      summary,
    };
  }

  async getEligibility(slug: string, customerId: string) {
    const product = await this.findActiveProductBySlug(slug);
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { emailVerifiedAt: true, fullName: true, email: true },
    });
    if (!customer) throw new NotFoundException("Клієнта не знайдено");

    const existing = await this.prisma.productReview.findUnique({
      where: {
        productId_customerId: { productId: product.id, customerId },
      },
      select: {
        id: true,
        status: true,
        rating: true,
        body: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const orderId = await this.findQualifyingOrderId(customerId, product.id);

    if (!orderId) {
      return {
        canReview: false,
        reason: "NO_PURCHASE" as const,
        verifiedPurchase: false,
        existingReview: this.mapExistingReview(existing),
      };
    }

    if (!customer.emailVerifiedAt) {
      return {
        canReview: false,
        reason: "EMAIL_NOT_VERIFIED" as const,
        verifiedPurchase: true,
        existingReview: this.mapExistingReview(existing),
      };
    }

    if (existing?.status === ReviewStatus.PENDING) {
      return {
        canReview: false,
        reason: "PENDING" as const,
        verifiedPurchase: true,
        existingReview: this.mapExistingReview(existing),
      };
    }

    if (existing?.status === ReviewStatus.PUBLISHED) {
      return {
        canReview: false,
        reason: "ALREADY_PUBLISHED" as const,
        verifiedPurchase: true,
        existingReview: this.mapExistingReview(existing),
      };
    }

    if (existing?.status === ReviewStatus.REJECTED) {
      return {
        canReview: true,
        reason: "RESUBMIT" as const,
        verifiedPurchase: true,
        existingReview: this.mapExistingReview(existing),
      };
    }

    return {
      canReview: true,
      reason: null,
      verifiedPurchase: true,
      existingReview: null,
    };
  }

  async createOrResubmit(slug: string, customerId: string, dto: CreateReviewDto) {
    const product = await this.findActiveProductBySlug(slug);
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { emailVerifiedAt: true, fullName: true, email: true },
    });
    if (!customer) throw new NotFoundException("Клієнта не знайдено");

    if (!customer.emailVerifiedAt) {
      throw new ForbiddenException("Підтвердіть email перед залишенням відгуку");
    }

    const orderId = await this.findQualifyingOrderId(customerId, product.id);
    if (!orderId) {
      throw new ForbiddenException(
        "Відгук можна залишити лише після отримання замовлення з цим товаром",
      );
    }

    const body = dto.body.trim();
    const authorDisplayName = formatReviewAuthorDisplayName(
      customer.fullName,
      customer.email,
    );

    const existing = await this.prisma.productReview.findUnique({
      where: {
        productId_customerId: { productId: product.id, customerId },
      },
    });

    if (existing?.status === ReviewStatus.PENDING) {
      throw new ConflictException("Відгук уже на модерації");
    }
    if (existing?.status === ReviewStatus.PUBLISHED) {
      throw new ConflictException("Ви вже залишили відгук на цей товар");
    }

    if (existing?.status === ReviewStatus.REJECTED) {
      const updated = await this.prisma.productReview.update({
        where: { id: existing.id },
        data: {
          rating: dto.rating,
          body,
          authorDisplayName,
          orderId,
          status: ReviewStatus.PENDING,
          rejectedReason: null,
          publishedAt: null,
        },
        select: { id: true, status: true },
      });
      return {
        id: updated.id,
        status: updated.status,
        message: "Дякуємо! Відгук з’явиться після перевірки.",
      };
    }

    const created = await this.prisma.productReview.create({
      data: {
        productId: product.id,
        customerId,
        orderId,
        rating: dto.rating,
        body,
        authorDisplayName,
        status: ReviewStatus.PENDING,
      },
      select: { id: true, status: true },
    });

    return {
      id: created.id,
      status: created.status,
      message: "Дякуємо! Відгук з’явиться після перевірки.",
    };
  }

  async listAdmin(query: AdminReviewsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const q = query.q?.trim();

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(q
        ? {
            OR: [
              { authorDisplayName: { contains: q, mode: "insensitive" as const } },
              { body: { contains: q, mode: "insensitive" as const } },
              { product: { name: { contains: q, mode: "insensitive" as const } } },
              { product: { slug: { contains: q, mode: "insensitive" as const } } },
              { customer: { email: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          customer: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.productReview.count({ where }),
    ]);

    return {
      items: items.map((r) => this.mapAdminReview(r)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async countPendingAdmin() {
    const total = await this.prisma.productReview.count({
      where: { status: ReviewStatus.PENDING },
    });
    return { total };
  }

  async findOneAdmin(id: string) {
    const review = await this.prisma.productReview.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, email: true, fullName: true } },
        order: { select: { id: true, orderNumber: true, orderStatus: true } },
      },
    });
    if (!review) throw new NotFoundException("Відгук не знайдено");
    return this.mapAdminReview(review);
  }

  async updateStatusAdmin(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException("Відгук не знайдено");

    if (
      dto.status !== ReviewStatus.PUBLISHED &&
      dto.status !== ReviewStatus.REJECTED
    ) {
      throw new BadRequestException("Дозволені лише статуси PUBLISHED або REJECTED");
    }

    if (dto.status === ReviewStatus.REJECTED && !dto.rejectedReason?.trim()) {
      throw new BadRequestException("Вкажіть причину відхилення");
    }

    const updated = await this.prisma.productReview.update({
      where: { id },
      data: {
        status: dto.status,
        rejectedReason:
          dto.status === ReviewStatus.REJECTED
            ? dto.rejectedReason?.trim() ?? null
            : null,
        publishedAt:
          dto.status === ReviewStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, email: true, fullName: true } },
      },
    });

    return this.mapAdminReview(updated);
  }

  async deleteAdmin(id: string) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException("Відгук не знайдено");
    await this.prisma.productReview.delete({ where: { id } });
    return { ok: true };
  }

  /** Для JSON-LD на сторінці товару. */
  async summaryByProductSlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      select: { id: true },
    });
    if (!product) return { averageRating: null, count: 0 };
    return this.summaryForProduct(product.id);
  }

  private async summaryForProduct(productId: string) {
    const agg = await this.prisma.productReview.aggregate({
      where: { productId, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const count = agg._count.rating;
    const avg = agg._avg.rating;
    return {
      averageRating:
        count > 0 && avg != null
          ? Math.round(avg * 10) / 10
          : null,
      count,
    };
  }

  private async findActiveProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      select: { id: true, slug: true, name: true },
    });
    if (!product) throw new NotFoundException("Товар не знайдено");
    return product;
  }

  private async findQualifyingOrderId(customerId: string, productId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        customerId,
        orderStatus: { in: REVIEW_ELIGIBLE_ORDER_STATUSES },
        items: { some: { productId } },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    return order?.id ?? null;
  }

  private mapPublicReview(review: {
    id: string;
    rating: number;
    body: string;
    authorDisplayName: string;
    orderId: string | null;
    publishedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: review.id,
      rating: review.rating,
      body: review.body,
      authorDisplayName: review.authorDisplayName,
      verifiedPurchase: review.orderId != null,
      publishedAt: (review.publishedAt ?? review.createdAt).toISOString(),
    };
  }

  private mapExistingReview(
    review: {
      id: string;
      status: ReviewStatus;
      rating: number;
      body: string;
      createdAt: Date;
      updatedAt: Date;
    } | null,
  ) {
    if (!review) return null;
    return {
      id: review.id,
      status: review.status,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  private mapAdminReview(review: {
    id: string;
    rating: number;
    body: string;
    authorDisplayName: string;
    status: ReviewStatus;
    rejectedReason: string | null;
    orderId: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    product: { id: string; name: string; slug: string };
    customer: { id: string; email: string; fullName: string | null };
    order?: {
      id: string;
      orderNumber: string;
      orderStatus: OrderStatus;
    } | null;
  }) {
    return {
      id: review.id,
      rating: review.rating,
      body: review.body,
      authorDisplayName: review.authorDisplayName,
      status: review.status,
      rejectedReason: review.rejectedReason,
      verifiedPurchase: review.orderId != null,
      publishedAt: review.publishedAt?.toISOString() ?? null,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      product: review.product,
      customer: review.customer,
      order: review.order ?? null,
    };
  }
}
