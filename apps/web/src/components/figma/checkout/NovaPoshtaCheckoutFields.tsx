"use client";

import { useCallback, useEffect, useState } from "react";
import { FigmaSearchSelect } from "@/components/figma/checkout/FigmaSearchSelect";
import { FigmaSelect } from "@/components/figma/checkout/FigmaSelect";
import {
  fetchNpSettlements,
  fetchNpWarehouses,
  type NpSettlementOption,
  type NpWarehouseOption,
} from "@/lib/nova-poshta";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export type NovaPoshtaSelection = {
  cityLabel: string;
  warehouseLabel: string;
  cityRef: string;
  warehouseRef: string;
  complete: boolean;
};

type NovaPoshtaCheckoutFieldsProps = {
  onSelectionChange: (selection: NovaPoshtaSelection) => void;
};

export function NovaPoshtaCheckoutFields({
  onSelectionChange,
}: NovaPoshtaCheckoutFieldsProps) {
  const [pointType, setPointType] = useState<"warehouse" | "postomat">(
    "warehouse",
  );

  const [cityInput, setCityInput] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [cityOptions, setCityOptions] = useState<NpSettlementOption[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<NpSettlementOption | null>(
    null,
  );

  const [warehouseInput, setWarehouseInput] = useState("");
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [warehouseOptions, setWarehouseOptions] = useState<NpWarehouseOption[]>(
    [],
  );
  const [warehousePage, setWarehousePage] = useState(1);
  const [warehouseHasMore, setWarehouseHasMore] = useState(false);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseLoadingMore, setWarehouseLoadingMore] = useState(false);
  const [warehouseError, setWarehouseError] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<NpWarehouseOption | null>(null);

  const debouncedCityQuery = useDebouncedValue(cityInput, 350);
  const debouncedWarehouseFind = useDebouncedValue(warehouseInput, 350);

  const notifyParent = useCallback(
    (city: NpSettlementOption | null, wh: NpWarehouseOption | null) => {
      onSelectionChange({
        cityLabel: city?.label ?? "",
        warehouseLabel: wh?.description ?? "",
        cityRef: city?.deliveryCityRef ?? "",
        warehouseRef: wh?.ref ?? "",
        complete: Boolean(city && wh),
      });
    },
    [onSelectionChange],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setCityLoading(true);
      setCityError(null);
      try {
        const q = debouncedCityQuery.trim();
        const items = await fetchNpSettlements(q.length >= 2 ? q : "");
        if (!cancelled) setCityOptions(items);
      } catch {
        if (!cancelled) {
          setCityError("Не вдалося завантажити міста");
          setCityOptions([]);
        }
      } finally {
        if (!cancelled) setCityLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedCityQuery]);

  useEffect(() => {
    setWarehouseOptions([]);
    setWarehousePage(1);
    setWarehouseHasMore(false);
    setSelectedWarehouse(null);
    setWarehouseInput("");
    notifyParent(selectedCity, null);
  }, [selectedCity, pointType, notifyParent]);

  useEffect(() => {
    if (!selectedCity) return;
    let cancelled = false;
    void (async () => {
      setWarehouseLoading(true);
      setWarehouseError(null);
      try {
        const page = await fetchNpWarehouses({
          cityRef: selectedCity.deliveryCityRef,
          pointType,
          page: 1,
          find: debouncedWarehouseFind,
        });
        if (!cancelled) {
          setWarehouseOptions(page.items);
          setWarehousePage(1);
          setWarehouseHasMore(page.hasMore);
        }
      } catch {
        if (!cancelled) {
          setWarehouseError("Не вдалося завантажити відділення");
          setWarehouseOptions([]);
        }
      } finally {
        if (!cancelled) setWarehouseLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCity, pointType, debouncedWarehouseFind]);

  async function loadMoreWarehouses() {
    if (!selectedCity || !warehouseHasMore || warehouseLoadingMore) return;
    const nextPage = warehousePage + 1;
    setWarehouseLoadingMore(true);
    try {
      const page = await fetchNpWarehouses({
        cityRef: selectedCity.deliveryCityRef,
        pointType,
        page: nextPage,
        find: debouncedWarehouseFind,
      });
      setWarehouseOptions((prev) => [...prev, ...page.items]);
      setWarehousePage(nextPage);
      setWarehouseHasMore(page.hasMore);
    } catch {
      setWarehouseError("Не вдалося завантажити ще");
    } finally {
      setWarehouseLoadingMore(false);
    }
  }

  const warehouseLabel =
    pointType === "postomat" ? "Поштомат" : "Відділення";

  return (
    <>
      <input
        type="hidden"
        name="deliveryCity"
        value={selectedCity?.label ?? ""}
      />
      <input
        type="hidden"
        name="deliveryAddress"
        value={selectedWarehouse?.description ?? ""}
      />

      <FigmaSelect
        label="Куди доставляти"
        required
        value={pointType}
        onChange={(v) =>
          setPointType(v === "postomat" ? "postomat" : "warehouse")
        }
        options={[
          { value: "warehouse", label: "Відділення" },
          { value: "postomat", label: "Поштомат" },
        ]}
      />

      <FigmaSearchSelect
        label="Місто доставки"
        placeholder="Почніть вводити назву міста"
        required
        inputValue={cityInput}
        onInputChange={(v) => {
          setCityInput(v);
          if (selectedCity && v !== selectedCity.label) {
            setSelectedCity(null);
            notifyParent(null, null);
          }
        }}
        options={cityOptions}
        loading={cityLoading}
        open={cityOpen}
        onOpenChange={setCityOpen}
        selected={selectedCity}
        getOptionKey={(s) => s.ref}
        getOptionLabel={(s) => s.label}
        onSelect={(s) => {
          setSelectedCity(s);
          setCityInput(s.label);
          notifyParent(s, null);
        }}
        hint={
          !cityInput.trim()
            ? "Показано обласні центри. Введіть назву для пошуку."
            : undefined
        }
        emptyText={cityError ?? "Нічого не знайдено"}
      />

      <FigmaSearchSelect
        label={`${warehouseLabel} *`}
        placeholder={
          selectedCity
            ? `Пошук ${warehouseLabel.toLowerCase()}а`
            : "Спочатку оберіть місто"
        }
        required
        disabled={!selectedCity}
        inputValue={warehouseInput}
        onInputChange={(v) => {
          setWarehouseInput(v);
          if (selectedWarehouse && v !== selectedWarehouse.description) {
            setSelectedWarehouse(null);
            notifyParent(selectedCity, null);
          }
        }}
        options={warehouseOptions}
        loading={warehouseLoading}
        open={warehouseOpen}
        onOpenChange={setWarehouseOpen}
        selected={selectedWarehouse}
        getOptionKey={(w) => w.ref}
        getOptionLabel={(w) => w.description}
        onSelect={(w) => {
          setSelectedWarehouse(w);
          setWarehouseInput(w.description);
          notifyParent(selectedCity, w);
        }}
        emptyText={
          warehouseError ??
          (selectedCity ? "Нічого не знайдено" : "Оберіть місто")
        }
        listFooter={
          warehouseHasMore ? (
            <button
              type="button"
              disabled={warehouseLoadingMore}
              className="w-full px-4 py-3 text-center text-[13px] font-semibold text-[#5C97A8] hover:bg-[#f0f6f7] disabled:opacity-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void loadMoreWarehouses()}
            >
              {warehouseLoadingMore ? "Завантаження…" : "Завантажити ще"}
            </button>
          ) : undefined
        }
      />
    </>
  );
}
