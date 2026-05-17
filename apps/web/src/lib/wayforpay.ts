const ARRAY_FIELDS = new Set(["productName", "productPrice", "productCount"]);

/** POST form to WayForPay hosted checkout. */
export function submitWayforpayForm(
  actionUrl: string,
  fields: Record<string, string | string[]>,
) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.acceptCharset = "utf-8";

  for (const [key, raw] of Object.entries(fields)) {
    const values = Array.isArray(raw) ? raw : [raw];
    const name = ARRAY_FIELDS.has(key) ? `${key}[]` : key;
    for (const v of values) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = v;
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
}
