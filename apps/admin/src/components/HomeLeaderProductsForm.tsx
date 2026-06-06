"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HOME_LEADER_SLOT_COUNT,
  homeLeaderSlotsFromValue,
  PUBLIC_SITE_SETTING_DEFAULTS,
  serializeHomeLeaderProductIds,
} from "@malva/site-settings";
import { adminFetch, ApiError } from "@/lib/api";
import type { Product, SiteSetting } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";

const SETTING_KEY = "home_leader_product_ids";

function productLabel(p: Product): string {
  const status = p.status === "HIDDEN" ? " [прихований]" : "";
  return `${p.name} (${p.slug})${status}`;
}

export function HomeLeaderProductsForm() {
  const toast = useToast();
  const qc = useQueryClient();
  const [slots, setSlots] = useState<string[]>(
    homeLeaderSlotsFromValue(PUBLIC_SITE_SETTING_DEFAULTS.home_leader_product_ids),
  );

  const { data: settings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => adminFetch<SiteSetting[]>("/admin/settings"),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => adminFetch<Product[]>("/admin/products"),
  });

  useEffect(() => {
    const row = settings.find((s) => s.key === SETTING_KEY);
    setSlots(
      homeLeaderSlotsFromValue(
        row?.value ?? PUBLIC_SITE_SETTING_DEFAULTS.home_leader_product_ids,
      ),
    );
  }, [settings]);

  const productOptions = useMemo(() => {
    const sorted = [...products].sort((a, b) =>
      a.name.localeCompare(b.name, "uk"),
    );
    return [
      { value: "", label: "— не обрано —" },
      ...sorted.map((p) => ({ value: p.id, label: productLabel(p) })),
    ];
  }, [products]);

  const save = useMutation({
    mutationFn: async (nextSlots: string[]) => {
      const value = serializeHomeLeaderProductIds(nextSlots);
      await adminFetch(`/admin/settings/${encodeURIComponent(SETTING_KEY)}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
    },
    onSuccess: () => {
      toast.success("Товари на головній збережено");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка збереження"),
  });

  function setSlot(index: number, productId: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = productId;
      return next;
    });
  }

  const isLoading = settingsLoading || productsLoading;

  return (
    <Card className="mb-6 space-y-4 p-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Головна — лідери продажу
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          До {HOME_LEADER_SLOT_COUNT} товарів у блоці «Лідери продажу» на
          головній. Порожні слоти ігноруються. Якщо нічого не обрано — показуються
          6 нових товарів з каталогу.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-admin-muted">Завантаження…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-admin-muted">
          Спочатку додайте товари в каталозі.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {slots.map((value, index) => (
            <Select
              key={index}
              label={`Слот ${index + 1}`}
              value={value}
              options={productOptions}
              onChange={(e) => setSlot(index, e.target.value)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        disabled={isLoading || save.isPending || products.length === 0}
        onClick={() => save.mutate(slots)}
      >
        Зберегти товари на головній
      </Button>
    </Card>
  );
}
