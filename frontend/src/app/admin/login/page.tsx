import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next ?? "/admin";

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-sky-100/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-sky-900">
            Vibe FinProduct
          </Link>
          <Link
            href="/products"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-50"
          >
            상품 목록
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <section className="mx-auto max-w-md rounded-3xl border border-sky-100 bg-white p-8 shadow-sm">
          <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Admin Login
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-sky-950">
            관리자 로그인
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            관리자 토큰을 입력하면 동기화 페이지에 접근할 수 있어요.
          </p>

          <form action="/api/admin/login" method="post" className="mt-6 grid gap-3">
            <input type="hidden" name="next" value={next} />
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-slate-600">토큰</span>
              <input
                name="token"
                type="password"
                placeholder="ADMIN_PAGE_TOKEN"
                className="h-11 rounded-xl border border-sky-100 bg-white px-3 text-sm outline-none ring-sky-200 focus:ring-4"
                required
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              로그인
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            로컬에서는 <span className="font-mono">frontend/.env.local</span>에{" "}
            <span className="font-mono">ADMIN_PAGE_TOKEN</span>을 설정하세요.
          </p>
        </section>
      </main>
    </div>
  );
}

