"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { figmaInputClass } from "@/components/store/MalvaGardenFigmaPageShell";
import { useFloatingListPosition } from "@/components/ui/useFloatingListPosition";

export type FigmaSelectOption = {
  value: string;
  label: string;
};

type FigmaSelectProps = {
  label: string;
  options: FigmaSelectOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

const listClassName =
  "max-h-[280px] overflow-y-auto rounded-xl border border-[#c5d8dc] bg-white py-1 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]";

const optionClassName =
  "w-full px-4 py-2.5 text-left text-[13px] text-[#333] transition-colors hover:bg-[#f0f6f7]";

export function FigmaSelect({
  label,
  options,
  value,
  onChange,
  name,
  required,
  disabled,
}: FigmaSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value) ?? options[0];

  const position = useFloatingListPosition(
    triggerRef,
    listRef,
    open && !disabled,
    () => setOpen(false),
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const portalList =
    open &&
    !disabled &&
    position &&
    typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className={listClassName}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    className={optionClassName}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative block space-y-1.5" ref={rootRef}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <span className="block text-[13px] font-semibold text-black">
        {label}
        {required ? " *" : ""}
      </span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        className={`${figmaInputClass} flex cursor-pointer items-center justify-between gap-2 text-left disabled:cursor-not-allowed`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 truncate">{selected?.label ?? ""}</span>
        <svg
          className={`size-4 shrink-0 text-[#5C97A8] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {portalList}
    </div>
  );
}

