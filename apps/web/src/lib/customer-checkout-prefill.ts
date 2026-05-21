import type { NovaPoshtaPrefill } from "@/components/figma/checkout/NovaPoshtaCheckoutFields";
import type { CustomerAddress } from "@/lib/customer-api";

export function pickDefaultNovaPoshtaAddress(
  items: CustomerAddress[],
): CustomerAddress | null {
  return (
    items.find(
      (a) => a.isDefault && a.novaPoshtaCityRef && a.novaPoshtaWarehouseRef,
    ) ??
    items.find((a) => a.novaPoshtaCityRef && a.novaPoshtaWarehouseRef) ??
    null
  );
}

export function customerAddressToNpPrefill(
  address: CustomerAddress,
): NovaPoshtaPrefill {
  return {
    pointType: /поштомат/i.test(address.deliveryAddress)
      ? "postomat"
      : "warehouse",
    city: {
      deliveryCityRef: address.novaPoshtaCityRef!,
      label: address.deliveryCity,
    },
    warehouse: {
      ref: address.novaPoshtaWarehouseRef!,
      description: address.deliveryAddress,
    },
  };
}
