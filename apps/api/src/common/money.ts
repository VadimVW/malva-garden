import { Decimal } from "@prisma/client/runtime/library";

export function moneyToString(value: Decimal) {
  return value.toString();
}
