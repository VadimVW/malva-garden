import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  NP_BRANCH_WAREHOUSE_TYPES,
  NP_POSTOMAT_WAREHOUSE_TYPES,
  NP_REGIONAL_CENTER_NAMES,
  NP_WAREHOUSES_PAGE_SIZE,
} from "./novaposhta.constants";
import type {
  NpApiResponse,
  NpSearchSettlementsRow,
  NpSettlementAddress,
  NpWarehouse,
  SettlementOption,
  WarehouseOption,
} from "./novaposhta.types";

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const REGIONAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
@Injectable()
export class NovaposhtaService {
  private readonly logger = new Logger(NovaposhtaService.name);
  private regionalCentersCache: {
    expiresAt: number;
    items: SettlementOption[];
  } | null = null;

  constructor(private readonly config: ConfigService) {}

  private apiKey(): string {
    return this.config.get<string>("NOVA_POSHTA_API_KEY") ?? "";
  }

  private async request<T>(
    calledMethod: string,
    methodProperties: Record<string, unknown>,
  ): Promise<T> {
    const body = {
      apiKey: this.apiKey(),
      modelName: "Address",
      calledMethod,
      language: "uk",
      methodProperties,
    };

    let res: Response;
    try {
      res = await fetch(NP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      this.logger.warn(`Nova Poshta network error: ${calledMethod}`, err);
      throw new ServiceUnavailableException(
        "Сервіс Нової пошти тимчасово недоступний",
      );
    }

    if (!res.ok) {
      throw new BadGatewayException("Помилка відповіді Нової пошти");
    }

    const json = (await res.json()) as NpApiResponse<T>;
    if (!json.success) {
      const msg = json.errors?.join("; ") || "Невідома помилка Нової пошти";
      this.logger.warn(`Nova Poshta API ${calledMethod}: ${msg}`);
      throw new BadGatewayException(msg);
    }

    return json.data;
  }

  private mapSettlement(addr: NpSettlementAddress): SettlementOption {
    return {
      ref: addr.Ref,
      deliveryCityRef: addr.DeliveryCity,
      label: addr.Present,
      mainDescription: addr.MainDescription,
    };
  }

  private async searchSettlementsRaw(
    cityName: string,
    limit: number,
  ): Promise<SettlementOption[]> {
    const data = await this.request<NpSearchSettlementsRow[]>(
      "searchSettlements",
      { CityName: cityName, Limit: limit },
    );
    const row = data[0];
    if (!row?.Addresses?.length) return [];
    return row.Addresses.map((a) => this.mapSettlement(a));
  }

  async getSettlements(query?: string): Promise<SettlementOption[]> {
    const q = query?.trim() ?? "";
    if (q.length < 2) {
      return this.getRegionalCenters();
    }
    return this.searchSettlementsRaw(q, 20);
  }

  private async getRegionalCenters(): Promise<SettlementOption[]> {
    const now = Date.now();
    if (
      this.regionalCentersCache &&
      this.regionalCentersCache.expiresAt > now
    ) {
      return this.regionalCentersCache.items;
    }

    const seen = new Set<string>();
    const items: SettlementOption[] = [];

    await Promise.all(
      NP_REGIONAL_CENTER_NAMES.map(async (name) => {
        try {
          const matches = await this.searchSettlementsRaw(name, 5);
          const match =
            matches.find(
              (m) =>
                m.mainDescription.toLowerCase() === name.toLowerCase() ||
                m.label.toLowerCase().startsWith(`м. ${name.toLowerCase()}`),
            ) ?? matches[0];
          if (match && !seen.has(match.deliveryCityRef)) {
            seen.add(match.deliveryCityRef);
            items.push(match);
          }
        } catch (err) {
          this.logger.warn(`Regional center lookup failed: ${name}`, err);
        }
      }),
    );

    items.sort((a, b) =>
      a.mainDescription.localeCompare(b.mainDescription, "uk"),
    );

    this.regionalCentersCache = {
      expiresAt: now + REGIONAL_CACHE_TTL_MS,
      items,
    };
    return items;
  }

  private warehouseTypesForPoint(pointType: string): readonly string[] {
    return pointType === "postomat"
      ? NP_POSTOMAT_WAREHOUSE_TYPES
      : NP_BRANCH_WAREHOUSE_TYPES;
  }

  private mapWarehouse(w: NpWarehouse): WarehouseOption {
    return {
      ref: w.Ref,
      description: w.Description,
      number: String(w.Number ?? ""),
      shortAddress: w.ShortAddress ?? w.Description,
    };
  }

  private sortWarehouses(items: WarehouseOption[]): WarehouseOption[] {
    return [...items].sort((a, b) => {
      const na = Number(a.number);
      const nb = Number(b.number);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
      return a.description.localeCompare(b.description, "uk");
    });
  }

  private async fetchWarehousesPage(
    cityRef: string,
    page: number,
    find: string,
  ): Promise<NpWarehouse[]> {
    const methodProperties: Record<string, unknown> = {
      CityRef: cityRef,
      Page: page,
      Limit: NP_WAREHOUSES_PAGE_SIZE,
    };
    if (find) {
      methodProperties.FindByString = find;
    }
    return this.request<NpWarehouse[]>("getWarehouses", methodProperties);
  }

  async getWarehouses(params: {
    cityRef: string;
    pointType: string;
    page?: number;
    find?: string;
  }): Promise<{ items: WarehouseOption[]; page: number; hasMore: boolean }> {
    const page = Math.max(1, params.page ?? 1);
    const find = params.find?.trim() ?? "";
    const allowedTypes = new Set(this.warehouseTypesForPoint(params.pointType));

    const data = await this.fetchWarehousesPage(params.cityRef, page, find);

    const items = this.sortWarehouses(
      data
        .filter((w) => allowedTypes.has(w.TypeOfWarehouse))
        .map((w) => this.mapWarehouse(w)),
    );

    const hasMore = data.length >= NP_WAREHOUSES_PAGE_SIZE;

    return { items, page, hasMore };
  }
}
