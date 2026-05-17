import { createHmac } from "crypto";

export function hmacMd5(message: string, secret: string): string {
  return createHmac("md5", secret).update(message, "utf8").digest("hex");
}

/** Purchase request signature (wiki.wayforpay.com Purchase). */
export function buildPurchaseSignString(params: {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: string;
  currency: string;
  productName: string[];
  productCount: string[];
  productPrice: string[];
}): string {
  const parts: string[] = [
    params.merchantAccount,
    params.merchantDomainName,
    params.orderReference,
    String(params.orderDate),
    params.amount,
    params.currency,
    ...params.productName,
    ...params.productCount,
    ...params.productPrice,
  ];
  return parts.join(";");
}

/** CHECK_STATUS request signature. */
export function buildCheckStatusSignString(params: {
  merchantAccount: string;
  orderReference: string;
}): string {
  return [params.merchantAccount, params.orderReference].join(";");
}

/** serviceUrl callback signature. */
export function buildCallbackSignString(params: {
  merchantAccount: string;
  orderReference: string;
  amount: string;
  currency: string;
  authCode: string;
  cardPan: string;
  transactionStatus: string;
  reasonCode: string;
}): string {
  return [
    params.merchantAccount,
    params.orderReference,
    params.amount,
    params.currency,
    params.authCode,
    params.cardPan,
    params.transactionStatus,
    params.reasonCode,
  ].join(";");
}

/** Merchant response to callback: orderReference;status;time */
export function buildCallbackResponseSignString(params: {
  orderReference: string;
  status: string;
  time: number;
}): string {
  return [params.orderReference, params.status, String(params.time)].join(";");
}

export function formatWayforpayAmount(value: {
  toString(): string;
}): string {
  const n = Number(value.toString());
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}
