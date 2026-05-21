"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MalvaGardenAccountNav } from "@/components/figma/account/MalvaGardenAccountNav";
import {
  NovaPoshtaCheckoutFields,
  type NovaPoshtaSelection,
} from "@/components/figma/checkout/NovaPoshtaCheckoutFields";
import {
  figmaInputClass,
  FigmaPrimaryButton,
} from "@/components/figma/MalvaGardenFigmaPageShell";
import {
  customerFetch,
  CustomerApiError,
  type CustomerAddress,
} from "@/lib/customer-api";
import { useCustomerAuth } from "@/providers/CustomerAuthProvider";

export function MalvaGardenAccountProfileDesktop() {
  const { customer, refresh } = useCustomerAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);

  const [npSelection, setNpSelection] = useState<NovaPoshtaSelection>({
    cityLabel: "",
    warehouseLabel: "",
    cityRef: "",
    warehouseRef: "",
    complete: false,
  });
  const [npFormKey, setNpFormKey] = useState(0);
  const [addrMsg, setAddrMsg] = useState<string | null>(null);

  const onNpSelectionChange = useCallback((selection: NovaPoshtaSelection) => {
    setNpSelection(selection);
  }, []);

  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName ?? "");
      setPhone(customer.phone ?? "");
    }
  }, [customer]);

  useEffect(() => {
    customerFetch<{ items: CustomerAddress[] }>("/customer/me/addresses")
      .then((data) => setAddresses(data.items))
      .finally(() => setLoadingAddr(false));
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await customerFetch("/customer/me", {
        method: "PATCH",
        body: JSON.stringify({ fullName, phone }),
      });
      await refresh();
      setProfileMsg("Збережено");
    } catch (err) {
      setProfileMsg(
        err instanceof CustomerApiError ? err.message : "Помилка збереження",
      );
    }
  }

  async function addAddress(e: FormEvent) {
    e.preventDefault();
    setAddrMsg(null);
    if (!npSelection.complete) {
      setAddrMsg("Оберіть місто та відділення / поштомат Нової пошти.");
      return;
    }
    try {
      await customerFetch("/customer/me/addresses", {
        method: "POST",
        body: JSON.stringify({
          deliveryCity: npSelection.cityLabel,
          deliveryAddress: npSelection.warehouseLabel,
          deliveryMethod: "nova_poshta",
          novaPoshtaCityRef: npSelection.cityRef,
          novaPoshtaWarehouseRef: npSelection.warehouseRef,
          isDefault: addresses.length === 0,
        }),
      });
      const data = await customerFetch<{ items: CustomerAddress[] }>(
        "/customer/me/addresses",
      );
      setAddresses(data.items);
      setNpSelection({
        cityLabel: "",
        warehouseLabel: "",
        cityRef: "",
        warehouseRef: "",
        complete: false,
      });
      setNpFormKey((k) => k + 1);
      setAddrMsg("Адресу додано");
    } catch (err) {
      setAddrMsg(
        err instanceof CustomerApiError ? err.message : "Не вдалося додати адресу",
      );
    }
  }

  async function removeAddress(id: string) {
    if (!confirm("Видалити цю адресу?")) return;
    await customerFetch(`/customer/me/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      <MalvaGardenAccountNav />
      <section className="mb-10">
        <h2 className="mb-4 text-[18px] font-bold text-black">Профіль</h2>
        <form onSubmit={saveProfile} className="max-w-lg space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-semibold">Email</label>
            <input
              type="email"
              value={customer?.email ?? ""}
              disabled
              className={`${figmaInputClass} opacity-70`}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold">ПІБ</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={figmaInputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={figmaInputClass}
            />
          </div>
          {profileMsg ? (
            <p className="text-[13px] text-[#2f6f4e]">{profileMsg}</p>
          ) : null}
          <FigmaPrimaryButton type="submit">Зберегти профіль</FigmaPrimaryButton>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-[18px] font-bold text-black">
          Збережені адреси доставки
        </h2>
        {loadingAddr ? (
          <p className="text-[14px] text-[#5C5C5C]">Завантаження…</p>
        ) : addresses.length === 0 ? (
          <p className="mb-4 text-[14px] text-[#5C5C5C]">
            Ще немає збережених адрес.
          </p>
        ) : (
          <ul className="mb-6 space-y-3">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[#c5d8dc] bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    {a.isDefault ? (
                      <span className="text-[11px] font-bold uppercase text-[#5C97A8]">
                        За замовчуванням
                      </span>
                    ) : null}
                    <p className="text-[14px] text-[#333]">
                      {a.deliveryCity}, {a.deliveryAddress}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddress(a.id)}
                    className="text-[13px] font-semibold text-red-700 hover:underline"
                  >
                    Видалити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="mb-3 text-[15px] font-semibold text-black">Додати адресу</h3>
        <form onSubmit={addAddress} className="max-w-lg space-y-4">
          <NovaPoshtaCheckoutFields
            key={npFormKey}
            onSelectionChange={onNpSelectionChange}
          />
          {addrMsg ? (
            <p
              className={`text-[13px] ${addrMsg === "Адресу додано" ? "text-[#2f6f4e]" : "text-[#333]"}`}
            >
              {addrMsg}
            </p>
          ) : null}
          <FigmaPrimaryButton type="submit">Додати</FigmaPrimaryButton>
        </form>
      </section>
    </>
  );
}
