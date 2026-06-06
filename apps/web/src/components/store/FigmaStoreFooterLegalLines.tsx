"use client";

import { useStoreHeaderSettings } from "@/providers/StoreHeaderSettingsProvider";

const DEVELOPER_TELEGRAM_URL = "https://t.me/vadimkrupin";
const DEVELOPER_TELEGRAM_HANDLE = "@vadimkrupin";

type Props = {
  className?: string;
};

/** Copyright з адмінки та підпис розробника сайту. */
export function FigmaStoreFooterLegalLines({ className }: Props) {
  const { copyright } = useStoreHeaderSettings();
  const hasCopyright = copyright.trim().length > 0;

  return (
    <div className={className}>
      <p className="text-center text-[12px] text-[#F7F4EF]/70">
        Made by{" "}
        <a
          href={DEVELOPER_TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#F7F4EF]/90 transition-opacity hover:underline hover:opacity-100"
        >
          {DEVELOPER_TELEGRAM_HANDLE}
        </a>
      </p>
      {hasCopyright ? (
        <p className="mt-1 text-center text-[12px] text-[#F7F4EF]/90">
          {copyright}
        </p>
      ) : null}
    </div>
  );
}
