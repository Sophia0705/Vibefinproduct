import Link from "next/link";
import ProductsFiltersClient from "./ProductsFiltersClient";
import BankLogo from "./BankLogo";
import { BANK_LOGO_SRC_BY_FIN_CO_NO } from "./bankLogos";

type ProductType = "DEPOSIT" | "SAVING";

type Bank = { finCoNo: string; korCoNm: string };

type SavingProductOption = {
  id: string;
  saveTrm: number;
  intrRate: string | null;
  intrRate2: string | null;
  intrRateTypeNm: string | null;
  rsrvTypeNm: string | null;
};

type SavingProduct = {
  id: string;
  finCoNo: string;
  korCoNm: string;
  finPrdtCd: string;
  finPrdtNm: string;
  productType: ProductType;
  joinWay: string | null;
  spclCnd: string | null;
  maxLimit: string | null;
  dclsMonth: string | null;
  options: SavingProductOption[];
};

function logoSrc(finCoNo: string) {
  return BANK_LOGO_SRC_BY_FIN_CO_NO[finCoNo] ?? null;
}

function formatRate(v: string | null) {
  if (!v) return "-";
  return `${v}%`;
}

function pickBestRate(options: SavingProductOption[]) {
  const vals = options
    .map((o) => (o.intrRate2 ?? o.intrRate) as string | null)
    .filter((v): v is string => !!v)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  if (vals.length === 0) return null;
  return Math.max(...vals);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    type?: ProductType | "ALL";
    q?: string;
    page?: string;
    finCoNo?: string;
    limit?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const type = sp.type && sp.type !== "ALL" ? sp.type : undefined;
  const q = (sp.q ?? "").trim();
  const page = Number(sp.page ?? "1") || 1;
  const finCoNo = (sp.finCoNo ?? "").trim();
  const limit = Math.min(100, Math.max(5, Number(sp.limit ?? "20") || 20));

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

  const banksUrl = new URL("/banks", baseUrl);
  const banksRes = await fetch(banksUrl.toString(), { cache: "no-store" });
  const banksData: { items: Bank[] } = banksRes.ok ? await banksRes.json() : { items: [] };

  const url = new URL("/saving-products", baseUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (type) url.searchParams.set("type", type);
  if (q) url.searchParams.set("q", q);
  if (finCoNo) url.searchParams.set("finCoNo", finCoNo);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load products: ${res.status} ${text}`);
  }

  const data: { items: SavingProduct[]; total: number; page: number; limit: number } =
    await res.json();

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  const pagesToShow = (() => {
    const p = Math.max(1, Math.min(totalPages, page));
    const set = new Set<number>([1, totalPages, p - 1, p, p + 1, p - 2, p + 2]);
    return Array.from(set)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
  })();

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-sky-100/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="text-lg font-semibold tracking-tight text-sky-900">
              Vibe FinProduct
            </Link>
            <span className="hidden text-sm text-slate-500 sm:inline">
              예·적금 금리 비교
            </span>
          </div>
          <div className="text-sm text-slate-500">
            총 <span className="font-semibold text-sky-900">{data.total}</span>개
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-sky-950">
            상품 목록
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            금융감독원 Open API 기반 데이터 (DEPOSIT=예금, SAVING=적금)
          </p>

          <ProductsFiltersClient
            banks={banksData.items}
            initial={{
              type: (sp.type ?? "ALL") as ProductType | "ALL",
              finCoNo,
              q,
              limit,
              page,
            }}
            summary={{ total: data.total, page: data.page, limit: data.limit }}
          />
        </section>

        <section className="mt-8 grid gap-4">
          {data.items.map((p) => {
            const best = pickBestRate(p.options);
            return (
              <article
                key={p.id}
                className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <BankLogo bankName={p.korCoNm} src={logoSrc(p.finCoNo)} />
                      <span className="text-sm font-medium text-slate-600">{p.korCoNm}</span>
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {p.productType}
                      </span>
                      {p.dclsMonth ? (
                        <span className="text-xs text-slate-400">공시 {p.dclsMonth}</span>
                      ) : null}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                      {p.finPrdtNm}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                      <span>
                        우대조건:{" "}
                        <span className="text-slate-800">{p.spclCnd ?? "-"}</span>
                      </span>
                      <span>
                        가입방법:{" "}
                        <span className="text-slate-800">{p.joinWay ?? "-"}</span>
                      </span>
                      <span>
                        최고한도:{" "}
                        <span className="text-slate-800">
                          {p.maxLimit ? `${p.maxLimit}원` : "-"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-linear-to-b from-sky-50 to-white px-5 py-4 ring-1 ring-sky-100">
                    <div className="text-xs font-medium text-slate-500">최고 우대금리</div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-sky-700">
                      {best === null ? "-" : `${best.toFixed(2)}%`}
                    </div>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-[560px] w-full border-separate border-spacing-0 overflow-hidden rounded-xl ring-1 ring-sky-100">
                    <thead className="bg-sky-50">
                      <tr className="text-left text-xs font-semibold text-slate-600">
                        <th className="px-4 py-3">기간(개월)</th>
                        <th className="px-4 py-3">기본금리</th>
                        <th className="px-4 py-3">우대금리</th>
                        <th className="px-4 py-3">금리유형</th>
                        <th className="px-4 py-3">적립유형</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-sm">
                      {p.options.length === 0 ? (
                        <tr>
                          <td className="px-4 py-4 text-slate-500" colSpan={5}>
                            옵션(기간별 금리) 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        p.options.map((o) => (
                          <tr key={o.id} className="border-t border-sky-50">
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {o.saveTrm}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{formatRate(o.intrRate)}</td>
                            <td className="px-4 py-3 text-sky-700">
                              {formatRate(o.intrRate2)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {o.intrRateTypeNm ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {o.rsrvTypeNm ?? "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </section>

        <nav className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={{
              pathname: "/products",
              query: { ...sp, page: String(Math.max(1, page - 1)), limit: String(limit) },
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-sky-100 transition ${
              page <= 1
                ? "pointer-events-none bg-white text-slate-300"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            이전
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {pagesToShow.map((p, idx) => {
              const prev = pagesToShow[idx - 1];
              const showEllipsis = idx > 0 && prev !== undefined && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {showEllipsis ? (
                    <span className="px-2 text-sm text-slate-400">…</span>
                  ) : null}
                  <Link
                    href={{
                      pathname: "/products",
                      query: { ...sp, page: String(p), limit: String(limit) },
                    }}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-sky-100 transition ${
                      p === page
                        ? "bg-sky-600 text-white"
                        : "bg-white text-sky-700 hover:bg-sky-50"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}
            <span className="ml-2 text-sm text-slate-500">
              {page} / {totalPages}
            </span>
          </div>

          <Link
            href={{
              pathname: "/products",
              query: { ...sp, page: String(Math.min(totalPages, page + 1)), limit: String(limit) },
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-sky-100 transition ${
              page >= totalPages
                ? "pointer-events-none bg-white text-slate-300"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            다음
          </Link>
        </nav>
      </main>
    </div>
  );
}

