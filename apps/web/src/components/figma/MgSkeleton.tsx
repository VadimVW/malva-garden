type BlockProps = { className?: string };

export function MgSkeleton({ className = "" }: BlockProps) {
  return <div className={`mg-skeleton ${className}`} aria-hidden />;
}

export function CartPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="min-w-0 flex-1 space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]"
          >
            <MgSkeleton className="size-[88px] shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-3">
              <MgSkeleton className="h-5 w-3/4 max-w-[240px] rounded-lg" />
              <MgSkeleton className="h-4 w-1/3 max-w-[120px] rounded-lg" />
              <MgSkeleton className="h-10 w-[140px] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <aside className="w-full shrink-0 rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:w-[320px]">
        <MgSkeleton className="mb-5 h-6 w-28 rounded-lg" />
        <MgSkeleton className="mb-3 h-4 w-full rounded-lg" />
        <MgSkeleton className="mb-3 h-4 w-2/3 rounded-lg" />
        <MgSkeleton className="mt-6 h-12 w-full rounded-xl" />
      </aside>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="min-w-0 flex-1 space-y-6 rounded-2xl bg-white p-8 shadow-[0px_6px_20px_rgba(0,0,0,0.08)]">
        <MgSkeleton className="h-6 w-32 rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <MgSkeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
        <MgSkeleton className="h-6 w-28 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <MgSkeleton key={`d-${i}`} className="h-12 w-full rounded-xl" />
        ))}
      </div>
      <aside className="w-full shrink-0 rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:w-[320px]">
        <MgSkeleton className="mb-4 h-6 w-40 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <MgSkeleton key={i} className="mb-3 h-4 w-full rounded-lg" />
        ))}
        <MgSkeleton className="mt-4 h-8 w-1/2 rounded-lg" />
      </aside>
    </div>
  );
}

export function CheckoutSummarySkeleton() {
  return (
    <aside className="w-full shrink-0 rounded-2xl bg-white p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] lg:w-[320px]">
      <MgSkeleton className="mb-4 h-6 w-40 rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <MgSkeleton key={i} className="mb-3 h-4 w-full rounded-lg" />
      ))}
      <MgSkeleton className="mt-4 h-8 w-1/2 rounded-lg" />
    </aside>
  );
}