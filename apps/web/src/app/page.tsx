export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
        Malva Garden
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
        Інтернет-магазин саду
      </h1>
      <p className="text-lg text-slate-600">
        Монорепозиторій: Next.js (apps/web) + NestJS (apps/api). Запустіть{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">
          npm run dev:web
        </code>{" "}
        та{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">
          npm run dev:api
        </code>{" "}
        з кореня проєкту.
      </p>
    </main>
  );
}
