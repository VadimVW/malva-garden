"use client";

import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

const DEVELOPER_TELEGRAM_URL = "https://t.me/vadimkrupin";
const DEVELOPER_TELEGRAM_HANDLE = "@vadimkrupin";

type Props = {
  className?: string;
};

/** Copyright з адмінки та підпис розробника в один рядок. */
export function FigmaStoreFooterLegalLines({ className }: Props) {
  const { copyright } = useStoreHeaderSettings();
  const trimmedCopyright = copyright.trim();

  return (
    <p className={`text-[12px] text-[#F7F4EF]/90 ${className ?? ""}`}>
      {trimmedCopyright ? (
        <>
          {trimmedCopyright}
          <span className="text-[#F7F4EF]/70"> · </span>
        </>
      ) : null}
      <span className="text-[#F7F4EF]/70">
        Made by{" "}
        <a
          href={DEVELOPER_TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#F7F4EF]/90 transition-opacity hover:underline hover:opacity-100"
        >
          {DEVELOPER_TELEGRAM_HANDLE}
        </a>
      </span>
    </p>
  );
}
