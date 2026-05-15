"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch, ApiError } from "@/lib/api";
import type { SiteSetting } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
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

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => adminFetch<SiteSetting[]>("/admin/settings"),
  });

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
        description="Пари key/value для публічного GET /site-settings"
      />

      <Card className="mb-6 space-y-4 p-6">
        <h2 className="text-sm font-semibold">Новий ключ</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Ключ"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="hero_title"
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
          Створити
        </Button>
      </Card>

      <Card className="overflow-hidden">
        {isLoading && (
          <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
        )}
        {error && (
          <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
        )}
        {data.length === 0 && !isLoading && (
          <p className="p-6 text-sm text-admin-muted">Налаштувань ще немає.</p>
        )}
        {data.map((row) => (
          <SettingRow
            key={row.id}
            row={row}
            onSave={(value) => upsert.mutate({ key: row.key, value })}
            onDelete={() => setDeleteKey(row.key)}
            saving={upsert.isPending}
          />
        ))}
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
