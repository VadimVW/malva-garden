"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PUBLIC_SITE_SETTING_DEFAULTS,
  PUBLIC_SITE_SETTING_FIELDS,
  phoneToViberUrl,
  type PublicSiteSettingKey,
} from "@malva/site-settings";
import { adminFetch, ApiError } from "@/lib/api";
import type { SiteSetting } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";

const SECTION_LABELS: Record<
  (typeof PUBLIC_SITE_SETTING_FIELDS)[number]["section"],
  string
> = {
  catalog_hub: "Hub каталогу `/catalog`",
  header: "Шапка та контакти",
  footer: "Footer (соцмережі та copyright)",
};

function isValidUrl(value: string, key: PublicSiteSettingKey): boolean {
  if (!value.trim()) return true;
  try {
    const u = new URL(value);
    if (key === "header_viber_url") {
      return u.protocol === "viber:" || u.protocol === "http:" || u.protocol === "https:";
    }
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function valuesFromRows(rows: SiteSetting[]): Record<PublicSiteSettingKey, string> {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out = { ...PUBLIC_SITE_SETTING_DEFAULTS };
  for (const key of Object.keys(out) as PublicSiteSettingKey[]) {
    const v = map.get(key)?.trim();
    if (v) out[key] = v;
  }
  return out;
}

export function PublicSiteSettingsForm() {
  const toast = useToast();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<PublicSiteSettingKey, string>>(
    PUBLIC_SITE_SETTING_DEFAULTS,
  );
  const [viberManual, setViberManual] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => adminFetch<SiteSetting[]>("/admin/settings"),
  });

  useEffect(() => {
    if (!data.length) return;
    setValues(valuesFromRows(data));
  }, [data]);

  const sections = useMemo(() => {
    const keys = Object.keys(SECTION_LABELS) as (keyof typeof SECTION_LABELS)[];
    return keys.map((section) => ({
      section,
      label: SECTION_LABELS[section],
      fields: PUBLIC_SITE_SETTING_FIELDS.filter((f) => f.section === section),
    }));
  }, []);

  const save = useMutation({
    mutationFn: async (payload: Record<PublicSiteSettingKey, string>) => {
      for (const field of PUBLIC_SITE_SETTING_FIELDS) {
        if (field.type === "url" && !isValidUrl(payload[field.key], field.key)) {
          throw new Error(`Некоректне посилання: ${field.label}`);
        }
      }
      await Promise.all(
        (Object.keys(payload) as PublicSiteSettingKey[]).map((key) =>
          adminFetch(`/admin/settings/${encodeURIComponent(key)}`, {
            method: "PUT",
            body: JSON.stringify({ value: payload[key] }),
          }),
        ),
      );
    },
    onSuccess: () => {
      toast.success("Налаштування збережено");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : (e as Error).message),
  });

  function setField(key: PublicSiteSettingKey, value: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "header_phone" && !viberManual) {
        const viber = phoneToViberUrl(value);
        if (viber) next.header_viber_url = viber;
      }
      if (key === "header_viber_url") {
        setViberManual(true);
      }
      return next;
    });
  }

  function syncViberFromPhone() {
    const viber = phoneToViberUrl(values.header_phone);
    if (!viber) {
      toast.error("Введіть коректний номер телефону");
      return;
    }
    setViberManual(false);
    setValues((prev) => ({ ...prev, header_viber_url: viber }));
    toast.success("Viber оновлено з номера телефону");
  }

  return (
    <Card className="mb-6 space-y-8 p-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Публічні налаштування вітрини
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Зміни на сайті без redeploy (кеш вітрини ~5 хв). Посилання «Клієнтам»
          — у розділі «Сторінки».
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-admin-muted">Завантаження…</p>
      ) : (
        sections.map(({ section, label, fields }) => (
          <section key={section} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="sm:col-span-2">
                  <Input
                    label={field.label}
                    value={values[field.key]}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={PUBLIC_SITE_SETTING_DEFAULTS[field.key]}
                    type={field.type === "url" ? "url" : "text"}
                  />
                  {field.hint ? (
                    <p className="mt-1 text-xs text-gray-500">{field.hint}</p>
                  ) : null}
                </div>
              ))}
            </div>
            {section === "header" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={syncViberFromPhone}
              >
                Оновити Viber з телефону (viber://)
              </Button>
            ) : null}
          </section>
        ))
      )}

      <Button
        type="button"
        disabled={save.isPending || isLoading}
        onClick={() => save.mutate(values)}
      >
        Зберегти публічні налаштування
      </Button>
    </Card>
  );
}
