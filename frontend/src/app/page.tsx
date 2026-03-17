import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-white text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col items-start px-6 py-16">
        <div className="w-full rounded-3xl border border-sky-100 bg-white p-10 shadow-sm">
          <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            금융감독원 Open API
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-sky-950">
            예·적금 금리 비교
          </h1>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              상품 보러가기
            </Link>
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-700 ring-1 ring-sky-100 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              관리자 동기화
            </Link>
            <Link
              href="/products?type=DEPOSIT"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              예금만 보기
            </Link>
            <Link
              href="/products?type=SAVING"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              적금만 보기
            </Link>
            </div>
        </div>
      </main>
    </div>
  );
}
