"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useFloatingListPosition } from "@/components/ui/useFloatingListPosition";
import {
  fetchSearchSuggestions,
  SEARCH_SUGGEST_DEBOUNCE_MS,
  SEARCH_SUGGEST_MIN_LENGTH,
  type SearchSuggestion,
} from "@/lib/searchSuggestions";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

const shellClass =
  "relative z-[45] flex h-[34px] min-w-0 flex-1 items-center gap-2.5 rounded-full border border-[#F7F4EF] px-2";
const mobileShellClass =
  "relative z-[45] flex h-[34px] min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[#F7F4EF] px-1.5";
const shellStyle = { paddingTop: 5, paddingBottom: 5 };

const listClassName =
  "max-h-[min(360px,50vh)] overflow-y-auto rounded-xl border border-[#c5d8dc] bg-white py-1 shadow-[0px_10px_30px_rgba(0,0,0,0.14)] ring-1 ring-black/5";

/** Tailwind `lg` — must match header chrome visibility (`lg:hidden` / `hidden lg:block`). */
const LG_MAX_WIDTH_PX = 1023;

function subscribeBelowLg(onStoreChange: () => void) {
  const mq = window.matchMedia(`(max-width: ${LG_MAX_WIDTH_PX}px)`);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getBelowLgSnapshot() {
  return window.matchMedia(`(max-width: ${LG_MAX_WIDTH_PX}px)`).matches;
}

function useIsBelowLg() {
  return useSyncExternalStore(
    subscribeBelowLg,
    getBelowLgSnapshot,
    () => false,
  );
}

function FigmaStoreSearchField({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = variant === "mobile";
  const isBelowLg = useIsBelowLg();
  /** Only the chrome that is visible at the current breakpoint may open suggestions. */
  const chromeActive = isMobile ? isBelowLg : !isBelowLg;
  const isSearchResultsPage = pathname === "/search";
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(isMobile);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listDismissed, setListDismissed] = useState(false);

  const trimmed = value.trim();
  const canSuggest =
    chromeActive &&
    !isSearchResultsPage &&
    expanded &&
    trimmed.length >= SEARCH_SUGGEST_MIN_LENGTH;
  const hasAllResultsLink = !loading && total > 0 && trimmed.length > 0;
  const optionCount = suggestions.length + (hasAllResultsLink ? 1 : 0);
  const dropdownOpen = canSuggest && !listDismissed;

  const listPosition = useFloatingListPosition(
    rootRef,
    listRef,
    dropdownOpen,
    () => setActiveIndex(-1),
    isMobile ? "viewport-center" : "anchor",
  );

  const dropdownWidth = isMobile
    ? listPosition?.width
    : listPosition
      ? Math.max(listPosition.width, 280)
      : undefined;

  useEffect(() => {
    if (pathname === "/search") {
      setValue(searchParams.get("q") ?? "");
      setExpanded(true);
      setListDismissed(true);
      setActiveIndex(-1);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!expanded || isMobile) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [expanded, isMobile]);

  useEffect(() => {
    setListDismissed(false);
  }, [trimmed]);

  useEffect(() => {
    if (!canSuggest) {
      setSuggestions([]);
      setTotal(0);
      setLoading(false);
      setActiveIndex(-1);
      setListDismissed(false);
      return;
    }

    const ac = new AbortController();
    setSuggestions([]);
    setTotal(0);
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetchSearchSuggestions(trimmed, ac.signal)
        .then(({ items, total: t }) => {
          setSuggestions(items);
          setTotal(t);
          setActiveIndex(-1);
        })
        .catch(() => {
          if (!ac.signal.aborted) {
            setSuggestions([]);
            setTotal(0);
          }
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    }, SEARCH_SUGGEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [trimmed, canSuggest]);

  useEffect(() => {
    if (isMobile || !expanded) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setExpanded(false);
      setActiveIndex(-1);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [expanded, isMobile]);

  const fieldShellClass = isMobile ? mobileShellClass : shellClass;

  function openSearch() {
    setExpanded(true);
  }

  function goToSearch(q?: string) {
    const query = (q ?? value).trim();
    if (!query) return;
    setListDismissed(true);
    setActiveIndex(-1);
    if (!isMobile) setExpanded(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function goToProduct(slug: string) {
    if (!isMobile) setExpanded(false);
    setActiveIndex(-1);
    router.push(`/product/${slug}`);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      goToProduct(suggestions[activeIndex].slug);
      return;
    }
    if (activeIndex === suggestions.length && hasAllResultsLink) {
      goToSearch();
      return;
    }
    goToSearch();
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (dropdownOpen) {
        if (activeIndex >= 0) {
          setActiveIndex(-1);
        } else {
          setListDismissed(true);
        }
        return;
      }
      setExpanded(false);
      inputRef.current?.blur();
      return;
    }

    if (!dropdownOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (optionCount === 0) return;
      setActiveIndex((i) => (i < optionCount - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (optionCount === 0) return;
      setActiveIndex((i) => (i > 0 ? i - 1 : optionCount - 1));
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < suggestions.length) {
        goToProduct(suggestions[activeIndex].slug);
      } else if (hasAllResultsLink) {
        goToSearch();
      }
    }
  }

  const showAllHref = trimmed
    ? `/search?q=${encodeURIComponent(trimmed)}`
    : undefined;

  const portalList =
    dropdownOpen &&
    listPosition &&
    typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Результати пошуку"
            className={listClassName}
            style={{
              position: "fixed",
              top: listPosition.top,
              left: listPosition.left,
              width: dropdownWidth,
              zIndex: 9999,
            }}
          >
            {loading && suggestions.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-[#5a5a5a]" role="presentation">
                Завантаження…
              </li>
            ) : null}

            {!loading && suggestions.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-[#5a5a5a]" role="presentation">
                Нічого не знайдено
              </li>
            ) : null}

            {suggestions.map((item, index) => {
              const active = index === activeIndex;
              return (
                <li key={item.id} role="option" aria-selected={active}>
                  <Link
                    href={`/product/${item.slug}`}
                    className={`flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#E7F1F3] ${
                      active ? "bg-[#E7F1F3]" : ""
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      if (!isMobile) setExpanded(false);
                      setActiveIndex(-1);
                    }}
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-[#dce8eb]">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized={
                            item.imageUrl.startsWith("http") &&
                            !item.imageUrl.includes("placehold")
                          }
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-black">
                        {item.name}
                      </span>
                      {item.categoryName ? (
                        <span className="mt-0.5 block truncate text-[11px] text-[#5C97A8]">
                          {item.categoryName}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-[12px] font-bold text-[#2f6f4e]">
                      {item.price}
                    </span>
                  </Link>
                </li>
              );
            })}

            {hasAllResultsLink && showAllHref ? (
              <li className="border-t border-[#E7F1F3]" role="option" aria-selected={activeIndex === suggestions.length}>
                <Link
                  href={showAllHref}
                  className={`block px-4 py-2.5 text-center text-[13px] font-bold text-[#5C97A8] transition-colors hover:bg-[#E7F1F3] ${
                    activeIndex === suggestions.length ? "bg-[#E7F1F3]" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(suggestions.length)}
                  onClick={() => {
                    if (!isMobile) setExpanded(false);
                    setActiveIndex(-1);
                  }}
                >
                  {total > suggestions.length
                    ? `Усі результати (${total})`
                    : "Усі результати"}
                </Link>
              </li>
            ) : null}
          </ul>,
          document.body,
        )
      : null;

  if (!expanded && !isMobile) {
    return (
      <div ref={rootRef} className={fieldShellClass} style={shellStyle}>
        <button
          type="button"
          onClick={openSearch}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full text-left transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F4EF]/80"
          aria-label="Відкрити пошук"
          aria-expanded={false}
          aria-controls="figma-store-search-input"
        >
          <SearchIcon className="size-5 shrink-0 text-[#F7F4EF]/70" />
          <span className="truncate text-[12px] leading-none text-[#F7F4EF]/50">
            Пошук
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div ref={rootRef} className={fieldShellClass} style={shellStyle}>
        <form
          onSubmit={onSubmit}
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <button
            type="submit"
            className="shrink-0 rounded-full transition-colors hover:text-[#F7F4EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F4EF]/80"
            aria-label="Знайти"
          >
            <SearchIcon className="size-5 text-[#F7F4EF]/70" />
          </button>
          <input
            ref={inputRef}
            id="figma-store-search-input"
            type="search"
            name="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onInputKeyDown}
            onFocus={() => {
              setListDismissed(false);
              setActiveIndex(-1);
            }}
            placeholder="Пошук"
            aria-label="Пошук товарів"
            aria-autocomplete="list"
            aria-controls={dropdownOpen ? listboxId : undefined}
            aria-expanded={dropdownOpen}
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 truncate border-0 bg-transparent text-[12px] leading-none text-[#F7F4EF] outline-none placeholder:text-[#F7F4EF]/50"
          />
        </form>
      </div>
      {portalList}
    </>
  );
}

export function FigmaStoreSearch({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const fieldShellClass = variant === "mobile" ? mobileShellClass : shellClass;
  return (
    <Suspense
      fallback={
        <div
          className={`${fieldShellClass} opacity-80`}
          style={shellStyle}
          aria-hidden
        >
          <SearchIcon className="size-5 shrink-0 text-[#F7F4EF]/50" />
          <span className="truncate text-[12px] text-[#F7F4EF]/50">Пошук</span>
        </div>
      }
    >
      <FigmaStoreSearchField variant={variant} />
    </Suspense>
  );
}
