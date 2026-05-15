const tones: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  yellow: "bg-amber-50 text-amber-900 ring-amber-200",
  red: "bg-red-50 text-red-800 ring-red-200",
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  blue: "bg-sky-50 text-sky-800 ring-sky-200",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
