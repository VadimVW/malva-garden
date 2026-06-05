import { OrderStatus } from "@prisma/client";

export const REVIEW_BODY_MIN = 20;
export const REVIEW_BODY_MAX = 2000;
export const REVIEW_RATING_MIN = 1;
export const REVIEW_RATING_MAX = 5;
export const REVIEW_DEFAULT_LIMIT = 10;
export const REVIEW_MAX_LIMIT = 50;

/** Замовлення, після яких дозволено залишити відгук (§7.21). */
export const REVIEW_ELIGIBLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
];
