"use client";

import { useState } from "react";

type Props = {
  description: string | null;
  careDescription: string | null;
};

export function ProductFigmaTabs({ description, careDescription }: Props) {
  const [tab, setTab] = useState<"desc" | "care">("desc");
  const descBody =
    description?.trim() ||
    "Опис товару з’явиться після заповнення в адмін-панелі.";
  const careBody =
    careDescription?.trim() ||
    "Рекомендації з догляду з’являться після заповнення в адмін-панелі.";

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
      <div className="relative flex gap-8 border-b border-[#E0E0E0] text-[15px] font-bold">
        <button
          type="button"
          onClick={() => setTab("desc")}
          className={`mg-tab-btn pb-3 ${
            tab === "desc" ? "text-black" : "text-[#9C9A9A]"
          }`}
        >
          <span
            className={`inline-block border-b-2 pb-3 transition-colors ${
              tab === "desc" ? "border-[#5C97A8]" : "border-transparent"
            }`}
          >
            Опис
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("care")}
          className={`mg-tab-btn pb-3 ${
            tab === "care" ? "text-black" : "text-[#9C9A9A]"
          }`}
        >
          <span
            className={`inline-block border-b-2 pb-3 transition-colors ${
              tab === "care" ? "border-[#5C97A8]" : "border-transparent"
            }`}
          >
            Догляд
          </span>
        </button>
      </div>
      <div key={tab} className="mg-tab-panel mt-5 text-[14px] leading-relaxed text-[#333333]">
        {tab === "desc" ? (
          <div className="space-y-4 whitespace-pre-wrap">{descBody}</div>
        ) : (
          <div className="space-y-4 whitespace-pre-wrap">{careBody}</div>
        )}
      </div>
    </section>
  );
}
