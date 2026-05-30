"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type FloatingListPosition = {
  top: number;
  left: number;
  width: number;
};

function positionsEqual(
  a: FloatingListPosition,
  b: FloatingListPosition,
): boolean {
  return a.top === b.top && a.left === b.left && a.width === b.width;
}

export type FloatingListStrategy = "anchor" | "viewport-center";

const VIEWPORT_CENTER_PAD = 15;
const VIEWPORT_CENTER_MAX_WIDTH = 360;

export function useFloatingListPosition(
  anchorRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
  strategy: FloatingListStrategy = "anchor",
) {
  const [position, setPosition] = useState<FloatingListPosition | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const positionRef = useRef<FloatingListPosition | null>(null);

  const measure = useCallback((): FloatingListPosition | null => {
    const anchor = anchorRef.current;
    if (!anchor) return null;
    const rect = anchor.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return null;
    }
    const top = rect.bottom + 4;
    if (strategy === "viewport-center") {
      const width = Math.min(
        window.innerWidth - VIEWPORT_CENTER_PAD * 2,
        VIEWPORT_CENTER_MAX_WIDTH,
      );
      return {
        top,
        left: (window.innerWidth - width) / 2,
        width,
      };
    }
    return {
      top,
      left: rect.left,
      width: rect.width,
    };
  }, [anchorRef, strategy]);

  const commitPosition = useCallback((next: FloatingListPosition | null) => {
    if (!next) {
      positionRef.current = null;
      setPosition(null);
      return;
    }
    if (
      positionRef.current &&
      positionsEqual(positionRef.current, next)
    ) {
      return;
    }
    positionRef.current = next;
    setPosition(next);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      positionRef.current = null;
      setPosition(null);
      return;
    }

    const initial = measure();
    if (!initial) {
      onDismissRef.current();
      return;
    }
    commitPosition(initial);

    let scrollRaf = 0;
    let trackRaf = 0;

    const syncPosition = () => {
      const next = measure();
      if (!next) {
        onDismissRef.current();
        return;
      }
      commitPosition(next);
    };

    const onScroll = (e: Event) => {
      const target = e.target;
      if (
        listRef.current &&
        target instanceof Node &&
        listRef.current.contains(target)
      ) {
        return;
      }
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(syncPosition);
    };

    const onResize = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(syncPosition);
    };

    const trackWhileOpen = () => {
      syncPosition();
      trackRaf = requestAnimationFrame(trackWhileOpen);
    };
    trackRaf = requestAnimationFrame(trackWhileOpen);

    const anchor = anchorRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            cancelAnimationFrame(scrollRaf);
            scrollRaf = requestAnimationFrame(syncPosition);
          })
        : null;
    if (anchor) {
      resizeObserver?.observe(anchor);
      const header = anchor.closest(".mg-figma-header");
      if (header) resizeObserver?.observe(header);
    }

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(scrollRaf);
      cancelAnimationFrame(trackRaf);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, measure, listRef, anchorRef, commitPosition]);

  return position;
}
