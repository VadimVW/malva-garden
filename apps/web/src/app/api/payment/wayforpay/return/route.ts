import { NextRequest, NextResponse } from "next/server";

/**
 * WayForPay redirects the customer to returnUrl with POST by default.
 * App Router pages cannot handle that POST — Next.js responds "Server action not found".
 * This route accepts POST and redirects to the GET return page.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  let orderNumber = url.searchParams.get("orderNumber");

  if (!orderNumber) {
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = (await request.json()) as Record<string, unknown>;
        orderNumber = String(json.orderReference ?? json.orderNumber ?? "");
      } else {
        const form = await request.formData();
        orderNumber = String(
          form.get("orderReference") ?? form.get("orderNumber") ?? "",
        );
      }
    } catch {
      /* ignore parse errors */
    }
  }

  const target = new URL("/order/payment/return", request.url);
  if (orderNumber) {
    target.searchParams.set("orderNumber", orderNumber);
  }
  return NextResponse.redirect(target, 303);
}
