import Link from "next/link";
import AdminSyncClient from "./AdminSyncClient";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-sky-100/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-sky-900">
            Vibe FinProduct
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-50"
            >
              상품 목록
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <AdminSyncClient />
        <div className="mt-6 text-xs text-slate-500">
          참고: `.env`의 <span className="font-mono">FSS_API_KEY</span> / DB 연결이 정상이어야
          합니다.
        </div>
      </main>
    </div>
  );
}

