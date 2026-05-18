import { getApiBaseUrl } from "@/lib/api";

export type NpSettlementOption = {
  ref: string;
  deliveryCityRef: string;
  label: string;
  mainDescription: string;
};

export type NpWarehouseOption = {
  ref: string;
  description: string;
  number: string;
  shortAddress: string;
};

export type NpWarehousesPage = {
  items: NpWarehouseOption[];
  page: number;
  hasMore: boolean;
};

export async function fetchNpSettlements(
  q: string,
): Promise<NpSettlementOption[]> {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  const url = `${getApiBaseUrl()}/delivery/nova-poshta/settlements${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<NpSettlementOption[]>;
}

export async function fetchNpWarehouses(opts: {
  cityRef: string;
  pointType: "warehouse" | "postomat";
  page: number;
  find?: string;
}): Promise<NpWarehousesPage> {
  const params = new URLSearchParams({
    cityRef: opts.cityRef,
    pointType: opts.pointType,
    page: String(opts.page),
  });
  if (opts.find?.trim()) params.set("find", opts.find.trim());
  const res = await fetch(
    `${getApiBaseUrl()}/delivery/nova-poshta/warehouses?${params}`,
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<NpWarehousesPage>;
}
