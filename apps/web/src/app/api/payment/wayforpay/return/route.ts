import { NextRequest, NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/public-origin";
import { sanitizeOrderNumber } from "@/lib/order-number";

/**
 * WayForPay redirects the customer to returnUrl with POST by default.
 * App Router pages cannot handle that POST — Next.js responds "Server action not found".
 * GET — fallback when WFP uses GET or the browser opens the URL after a failed POST.
 */
function orderNumberFromQuery(request: NextRequest): string | null {
  return sanitizeOrderNumber(
    new URL(request.url).searchParams.get("orderNumber"),
  );
}

async function orderNumberFromPostBody(
  request: NextRequest,
): Promise<string | null> {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      return sanitizeOrderNumber(
        String(json.orderReference ?? json.orderNumber ?? ""),
      );
    }
    const form = await request.formData();
    return sanitizeOrderNumber(
      String(form.get("orderReference") ?? form.get("orderNumber") ?? ""),
    );
  } catch {
    return null;
  }
}

function redirectToReturnPage(
  request: NextRequest,
  orderNumber: string | null,
): NextResponse {
  const target = new URL(absoluteUrl("/order/payment/return", request));
  if (orderNumber) {
    target.searchParams.set("orderNumber", orderNumber);
  }
  return NextResponse.redirect(target, 303);
}

export async function GET(request: NextRequest) {
  return redirectToReturnPage(request, orderNumberFromQuery(request));
}

export async function POST(request: NextRequest) {
  const orderNumber =
    orderNumberFromQuery(request) ?? (await orderNumberFromPostBody(request));
  return redirectToReturnPage(request, orderNumber);
}
