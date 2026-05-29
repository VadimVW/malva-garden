"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { figmaInputClass } from "@/components/store/MalvaGardenFigmaPageShell";
import { useFloatingListPosition } from "@/components/ui/useFloatingListPosition";

type FigmaSearchSelectProps<T> = {
  label: string;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  options: T[];
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: T | null;
  getOptionKey: (item: T) => string;
  getOptionLabel: (item: T) => string;
  onSelect: (item: T) => void;
  emptyText?: string;
  listFooter?: ReactNode;
  hint?: string;
};

const listClassName =
  "max-h-[280px] overflow-y-auto rounded-xl border border-[#c5d8dc] bg-white py-1 shadow-[0px_8px_24px_rgba(0,0,0,0.12)]";

export function FigmaSearchSelect<T>({
  label,
  placeholder,
  required,
  disabled,
  inputValue,
  onInputChange,
  options,
  loading,
  open,
  onOpenChange,
  selected,
  getOptionKey,
  getOptionLabel,
  onSelect,
  emptyText = "Нічого не знайдено",
  listFooter,
  hint,
}: FigmaSearchSelectProps<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const position = useFloatingListPosition(
    inputRef,
    listRef,
    open && !disabled,
    () => onOpenChange(false),
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      onOpenChange(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onOpenChange]);

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
            {loading && options.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-[#5a5a5a]">
                Завантаження…
              </li>
            ) : null}
            {!loading && options.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-[#5a5a5a]">
                {emptyText}
              </li>
            ) : null}
            {options.map((item) => {
              const isSelected =
                selected !== null &&
                getOptionKey(selected) === getOptionKey(item);
              return (
                <li
                  key={getOptionKey(item)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-[13px] text-[#333] transition-colors hover:bg-[#f0f6f7]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                  >
                    {getOptionLabel(item)}
                  </button>
                </li>
              );
            })}
            {listFooter ? (
              <li className="border-t border-[#eef2f3]">{listFooter}</li>
            ) : null}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative block space-y-1.5" ref={rootRef}>
      <span className="block text-[13px] font-semibold text-black">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        disabled={disabled}
        required={required && !selected}
        className={figmaInputClass}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          onInputChange(e.target.value);
          onOpenChange(true);
        }}
        onFocus={() => onOpenChange(true)}
      />
      {hint ? (
        <p className="text-[12px] text-[#5a5a5a]">{hint}</p>
      ) : null}
      {portalList}
    </div>
  );
}
