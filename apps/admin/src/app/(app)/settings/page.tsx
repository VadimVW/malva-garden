"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isPublicSiteSettingKey } from "@malva/site-settings";
import { adminFetch, ApiError } from "@/lib/api";
import type { SiteSetting } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { HomeLeaderProductsForm } from "@/components/HomeLeaderProductsForm";
import { PublicSiteSettingsForm } from "@/components/PublicSiteSettingsForm";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";

export default function SettingsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => adminFetch<SiteSetting[]>("/admin/settings"),
  });

  const otherSettings = data.filter((row) => !isPublicSiteSettingKey(row.key));

  const createSetting = useMutation({
    mutationFn: () =>
      adminFetch<SiteSetting>("/admin/settings", {
        method: "POST",
        body: JSON.stringify({ key: newKey, value: newValue }),
      }),
    onSuccess: () => {
      toast.success("Ключ створено");
      setNewKey("");
      setNewValue("");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const upsert = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminFetch(`/admin/settings/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      toast.success("Збережено");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  const remove = useMutation({
    mutationFn: (key: string) =>
      adminFetch(`/admin/settings/${encodeURIComponent(key)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Видалено");
      setDeleteKey(null);
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Помилка"),
  });

  return (
    <>
      <PageHeader
        title="Налаштування сайту"
        description="Контакти, hub каталогу, footer — форма нижче. Публічний API повертає лише whitelist ключів."
      />

      <PublicSiteSettingsForm />

      <HomeLeaderProductsForm />

      <Card className="mb-6 p-6">
        <button
          type="button"
          className="text-sm font-semibold text-gray-900 hover:underline"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? "Сховати" : "Показати"} службові ключі (не на вітрині)
        </button>
        {showAdvanced ? (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-gray-500">
              Ключі поза whitelist не потрапляють у GET /site-settings. Для
              вітрини використовуйте форму вище.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Новий ключ"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="internal_flag"
              />
              <Input
                label="Значення"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button
              type="button"
              disabled={!newKey || createSetting.isPending}
              onClick={() => createSetting.mutate()}
            >
              Створити службовий ключ
            </Button>
            <Card className="overflow-hidden">
              {isLoading && (
                <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
              )}
              {error && (
                <p className="p-6 text-sm text-red-600">
                  {(error as Error).message}
                </p>
              )}
              {otherSettings.length === 0 && !isLoading && (
                <p className="p-6 text-sm text-admin-muted">
                  Службових ключів немає.
                </p>
              )}
              {otherSettings.map((row) => (
                <SettingRow
                  key={row.id}
                  row={row}
                  onSave={(value) => upsert.mutate({ key: row.key, value })}
                  onDelete={() => setDeleteKey(row.key)}
                  saving={upsert.isPending}
                />
              ))}
            </Card>
          </div>
        ) : null}
      </Card>

      <Modal
        open={!!deleteKey}
        title="Видалити налаштування?"
        onClose={() => setDeleteKey(null)}
        onConfirm={() => deleteKey && remove.mutate(deleteKey)}
        loading={remove.isPending}
      >
        Ключ «{deleteKey}» буде видалено.
      </Modal>
    </>
  );
}

function SettingRow({
  row,
  onSave,
  onDelete,
  saving,
}: {
  row: SiteSetting;
  onSave: (value: string) => void;
  onDelete: () => void;
  saving?: boolean;
}) {
  const [value, setValue] = useState(row.value);

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-admin-border p-4 last:border-0">
      <p className="min-w-[10rem] font-mono text-sm text-gray-900">{row.key}</p>
      <div className="min-w-0 flex-1">
        <Input
          label="Значення"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="button" disabled={saving} onClick={() => onSave(value)}>
        Зберегти
      </Button>
      <Button type="button" variant="danger" onClick={onDelete}>
        Видалити
      </Button>
    </div>
  );
}
