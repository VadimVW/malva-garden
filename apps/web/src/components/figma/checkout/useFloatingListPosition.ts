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

function applyPositionToList(
  list: HTMLElement,
  position: FloatingListPosition,
) {
  list.style.top = `${position.top}px`;
  list.style.left = `${position.left}px`;
  list.style.width = `${position.width}px`;
}

export function useFloatingListPosition(
  anchorRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
) {
  const [position, setPosition] = useState<FloatingListPosition | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const measure = useCallback((): FloatingListPosition | null => {
    const anchor = anchorRef.current;
    if (!anchor) return null;
    const rect = anchor.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return null;
    }
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    };
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const initial = measure();
    if (!initial) {
      onDismissRef.current();
      return;
    }
    setPosition(initial);

    let raf = 0;
    const syncPosition = () => {
      const next = measure();
      if (!next) {
        onDismissRef.current();
        return;
      }
      if (listRef.current) {
        applyPositionToList(listRef.current, next);
      }
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
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncPosition);
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = measure();
        if (!next) {
          onDismissRef.current();
          return;
        }
        setPosition(next);
        if (listRef.current) {
          applyPositionToList(listRef.current, next);
        }
      });
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, measure, listRef]);

  return position;
}
