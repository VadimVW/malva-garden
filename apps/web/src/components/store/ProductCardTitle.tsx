"use client";

import { useLayoutEffect, useRef, useState } from "react";

type ProductCardTitleProps = {
  title: string;
  as?: "h2" | "h3";
  className?: string;
};

export function ProductCardTitle({
  title,
  as: Tag = "h2",
  className,
}: ProductCardTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [title]);

  return (
    <Tag
      ref={ref}
      lang="uk"
      title={truncated ? title : undefined}
      className={className}
    >
      {title}
    </Tag>
  );
}
